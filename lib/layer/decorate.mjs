export default async layer => {
  
  // Decorate layer format methods.
  await mapp.layer.formats[layer.format](layer);
  
  Object.assign(layer, {
    show,
    showCallbacks: [],
    hide,
    hideCallbacks: [],
    tableCurrent,
    tableMax,
    tableMin,
    zoomToExtent,
  });

  if (layer.edit) {
    console.warn(`Layer: ${layer.key}, please update edit:{} to use draw:{} as layer.edit has been superseeded with layer.draw to be in line with the OL drawing interaction.`)
    layer.draw = Object.assign(layer.draw || {}, layer.edit)
  }

  // Layer must have an empty draw config to allow for role based assignment of drawing methods.
  layer.draw ??= {}

  if (layer.draw?.delete) {
    console.warn(`Layer: ${layer.key}, please move draw.delete to use layer.deleteLocation:true.`)
  }

  // Callback which creates and stores a location from a feature returned by the drawing interaction.
  layer.draw.callback = async (feature, params) => {

    if (!feature) return;

    const location = {
      layer,
      new: true
    }

    // Store location in database.
    // The id must be returned from a serial ID field.
    location.id = await mapp.utils.xhr({
      method: 'POST',
      url: `${layer.mapview.host}/api/location/new?` +
        mapp.utils.paramString({
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: layer.tableCurrent()
        }),
      body: JSON.stringify(Object.assign({
        [layer.geom]: feature.geometry
      },

        // Assign default properties.
        params?.defaults || {},
        layer.draw?.defaults || {}))
    })

    layer.reload()

    // Get the newly created location.
    mapp.location.get(location)
  }

  // Set layer filter.
  layer.filter = Object.assign({
    current: {}
  }, layer.filter);

  // Set layer opacity from style.
  layer.L.setOpacity(layer.style?.opacity || 1);

  // Layer style has multiple themes.
  if (layer.style?.themes) {

    // Keep object theme.
    layer.style.theme = typeof layer.style.theme === 'object' ? layer.style.theme

      // Assign theme from key [string], or first theme.
      : layer.style.themes[layer.style.theme || Object.keys(layer.style.themes)[0]];
  }

  if (layer.hover) {

    console.warn(`Layer: ${layer.key}, layer.hover{} should be defined within layer.style{}.`)
    layer.style.hover = layer.hover;
    delete layer.hover;
  }

  // Layer style has multiple themes.
  if (layer.style?.hovers) {

    // Keep object hover.
    layer.style.hover = typeof layer.style.hover === 'object' ? layer.style.hover

      // Assign label from key [string], or first label.
      : layer.style.hovers[layer.style.hover || Object.keys(layer.style.hovers)[0]];
  }

  if (layer.style?.hover) {
    
    // Assign default featureHover method if non is provided.
    layer.style.hover.method ??= mapp.layer.featureHover;
  }

  // Layer style has multiple themes.
  if (layer.style?.labels) {

    // Keep object label.
    layer.style.label = typeof layer.style.label === 'object' ? layer.style.label

      // Assign label from key [string], or first label.
      : layer.style.labels[layer.style.label || Object.keys(layer.style.labels)[0]];
  }

  // Ammend layer json with user role config.
  if (Array.isArray(mapp.user?.roles)) {

    // Iterate through the layer.roles object.
    Object.keys(layer.roles || {}).forEach(role => {

      // Check whether the role value is an object and not null
      if (layer.roles[role] !== null && typeof layer.roles[role] === 'object'

        // Check whether role is included or a negated role is not included in user.roles
        && mapp.user.roles.includes(role) || !mapp.user.roles.includes(role.match(/(?<=^!)(.*)/g)?.[0])) {

        // Merge the role object with the layer.
        mapp.utils.merge(layer, layer.roles[role])
      }
    })

    // Adjust infoj entries for user roles.
    layer.infoj?.filter(entry => typeof entry.roles === 'object').forEach(entry => {

      Object.keys(entry.roles).forEach(role => {

        // Check whether the role value is an object
        if (typeof entry.roles[role] === 'object'

          // Check whether role is included
          && mapp.user.roles.includes(role)
          
          // or whether a negated role is not included in user.roles
          || role.match(/(?<=^!)(.*)/g)?.[0] && !mapp.user.roles.includes(role.match(/(?<=^!)(.*)/g)?.[0])) {

            // Merge the role object with the entry.
            mapp.utils.merge(entry, entry.roles[role])

        }
      })

    })
  }

  // Call layer and/or plugin methods.
  Object.keys(layer).forEach((key) => {

    // Check for layer method matching the layer key.
    mapp.layer[key]?.(layer);

    // Or plugin method and provide the layer object as argument.
    mapp.plugins[key]?.(layer);

    // It is possible to have a plugin method of the same name as a layer method.
  });

  return layer;
}

function show() {
  /**
   * Reveals the layer
   */

  this.display = true;

  try { // Add layer to map
    this.mapview.Map.addLayer(this.L);
  } catch {
    // Will catch assertation error when layer is already added.
  }

  // Reload layer data if available.
  this.reload instanceof Function && this.reload();

  // Add layer attribution to mapview attribution.
  this.mapview.attribution?.check();

  // Push the layer into the layers hook array.
  this.mapview.hooks && mapp.hooks.push('layers', this.key);

  // Execute showCallbacks
  this.showCallbacks?.forEach(fn => fn instanceof Function && fn(this));
}

function hide() {
  /**
   * Hides the layer
   */

  this.display = false;

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L);

  // Remove layer attribution from mapview attribution.
  this.mapview.attribution?.check();

  // Filter the layer from the layers hook array.
  this.mapview.hooks && mapp.hooks.filter('layers', this.key);

  // Execute hideCallbacks
  this.hideCallbacks?.forEach(fn => fn instanceof Function && fn(this));
}

function tableCurrent() {
  /**
   * Returns the current table
   */

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table;

  let table;

  // Get current zoom level from mapview.
  const zoom = parseInt(this.mapview.Map.getView().getZoom());

  // Get zoom level keys from layer.tables object.
  const zoomKeys = Object.keys(this.tables);

  // Get first zoom level key from array.
  const minZoomKey = parseInt(zoomKeys[0]);
  const maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
     
  // Get the table for the current zoom level.
  table = this.tables[zoom];

  // Get the first table if the current zoom level is smaller than the min.
  table = zoom < minZoomKey ? this.tables[minZoomKey] : table;

  // Get the last table if the current zoom level is larger than the max.
  table = zoom > maxZoomKey ? this.tables[maxZoomKey] : table;

  return table;
}

function tableMax() {
  /**
   * Returns the max table
   */

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table;

  // Return first value from (reversed) tables object which is not null.
  return Object.values(this.tables).reverse().find(val => !!val);
}

function tableMin() {
  /**
   * Returns the min table
   */

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table;

  // Return first value from tables object which is not null.
  return Object.values(this.tables).find(val => !!val);
}

async function zoomToExtent(params) {
  /**
   * Zooms to a specific extent
   */
  
  // XMLHttpRequest to layer extent endpoint
  let response = await mapp.utils.xhr(`${this.mapview.host}/api/query/layer_extent?`+
    mapp.utils.paramString({ // build query string for the url
      dbs: this.dbs,
      locale: this.mapview.locale.key,
      layer: this.key,
      table: this.table || Object.values(this.tables)[0] || Object.values(this.tables)[1],
      geom: this.geom,
      proj: this.srid,
      srid: this.mapview.srid,
      filter: this.filter.current
    })
  );

  // If failed to fetch response
  if (!response) {
    return false;
  }

  // re matches text in parentheses
  const bounds = /\((.*?)\)/.exec(response.box2d)[1].replace(/ /g, ',');

  this.mapview.fitView( // fit the map view within bounds 
    bounds.split(',').map( // get a float array of bounds
      coords => parseFloat(coords)
    ),
    params
  );

  return true;
}