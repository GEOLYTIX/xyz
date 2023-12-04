export default async layer => {

  // Decorate layer format methods.
  await mapp.layer.formats[layer.format](layer);

  Object.assign(layer, {
    show,
    showCallbacks: [],
    hide,
    hideCallbacks: [],
    tableCurrent,
    geomCurrent,
    tableMax,
    tableMin,
    zoomToExtent,
  });

  // Warn if outdated layer.edit configuration is used.
  if (layer.edit) {
    console.warn(`Layer: ${layer.key}, please update edit:{} to use draw:{} as layer.edit has been superseeded with layer.draw to be in line with the OL drawing interaction.`)
    layer.draw = Object.assign(layer.draw || {}, layer.edit)
  }

  // Layer must have an empty draw config to allow for role based assignment of drawing methods.
  layer.draw ??= {}

  // Warn if outdated layer.draw.delete configuration is used.
  if (layer.draw?.delete) {
    console.warn(`Layer: ${layer.key}, please move draw.delete to use layer.deleteLocation:true.`)
  }

  // Callback which creates and stores a location from a feature returned by the drawing interaction.
  layer.draw.callback = async (feature, params) => {

    // If the feature is null, return.
    if (!feature) return;

    // Get the current table and set new to true.
    const location = {
      layer,
      table: layer.tableCurrent(),
      new: true
    }

    // Store location in database.
    // The id must be returned from a serial ID field.
    location.id = await mapp.utils.xhr({
      method: 'POST',
      url: `${layer.mapview.host}/api/query?` +
        mapp.utils.paramString({
          template: 'location_new',
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: location.table
        }),
      body: JSON.stringify({
        [layer.geom]: feature.geometry,

        // Spread in defaults.
        ...params?.defaults,
        ...layer.draw?.defaults})
    })

    // Check whether feature is loaded on MVT update.
    if (layer.format === 'mvt') {

      layer.features = []

      // Concat layer.features array with features from tileloadend
      layer.source.on('tileloadend', concatFeatures);

      function concatFeatures(e) {

        layer.features = layer.features.concat(e.tile.getFeatures())
      }

      setTimeout(checkFeature, 1000)

      function checkFeature() {
  
        let found = layer.features?.find(F => F.properties?.id === location.id)
  
        if (found) {

          layer.source.un('tileloadend', concatFeatures);
        } else {

          layer.reload()
        }
      }
    }

    // Layer must be reloaded to reflect geometry changes.
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

  // Layer style has multiple hovers and a single hover (incorrect configuration)
  if (layer.style?.hovers && layer.style?.hover) {

    console.warn(`Layer: ${layer.key}, cannot use both layer.style.hover and layer.style.hovers. Layer.style.hover has been deleted.`)
    delete layer.style.hover;
  }

  // Layer style has multiple labels and a single label (incorrect configuration)
  if (layer.style?.labels && layer.style?.label) {

    console.warn(`Layer: ${layer.key}, cannot use both layer.style.label and layer.style.labels. Layer.style.label has been deleted.`)
    delete layer.style.label;
  }

  // Layer style has multiple themes.
  if (layer.style?.themes) {

    Object.keys(layer.style.themes).forEach(key => {

      // Assign theme key as title if undefined.
      layer.style.themes[key].title ??= key

      if (layer.style.themes[key].skip) delete layer.style.themes[key]
    })

    // Keep object theme.
    layer.style.theme = typeof layer.style.theme === 'object'
    
      ? layer.style.theme

      // Assign theme from key [string], or first theme.
      : layer.style.themes[layer.style.theme || Object.keys(layer.style.themes)[0]];
  }

  // If setLabel is included and labels object exists.
  if (layer.style?.theme?.setLabel && layer.style?.labels) {

    // Swap the label based on the setLabel key.
    layer.style.label = layer.style.labels[layer.style.theme.setLabel]
  }

    // Warn if outdated layer.hover configuration is used.
  // Set layer.style.hover and remove layer.hover.
  if (layer.hover) {

    console.warn(`Layer: ${layer.key}, layer.hover{} should be defined within layer.style{}.`)
    layer.style.hover = layer.hover;
    delete layer.hover;
  }

  // If setHover is included and hovers object exists.
  if (layer.style?.theme?.setHover && layer.style?.hovers) {

    // Swap the hover based on the setHover key.
    layer.style.hover = layer.style.hovers[layer.style.theme.setHover]
  }


  // Layer style has multiple hovers
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

  // Layer style has multiple labels.
  if (layer.style?.labels) {

    // Keep object label.
    layer.style.label = typeof layer.style.label === 'object' ? layer.style.label

      // Assign label from key [string], or first label.
      : layer.style.labels[layer.style.label || Object.keys(layer.style.labels)[0]];
  }

  // Check if the mapp.user.roles array exists and is an array
  if (Array.isArray(mapp.user?.roles)) {

    // Iterate through each role in the layer.roles object
    for (const role in layer.roles || {}) {

      // Check if the role is an object and not null
      if (layer.roles[role] !== null && typeof layer.roles[role] === 'object') {

        // Extract the role name from negated roles (e.g., "!role" becomes "role")
        const negatedRole = role.match(/(?<=^!)(.*)/g)?.[0];

        // Check if the role is included in mapp.user.roles
        if (mapp.user.roles.includes(role)) {

          // Merge the role object with the layer
          mapp.utils.merge(layer, layer.roles[role]);
        }

        // Check if the negated role is not included in mapp.user.roles
        else if (negatedRole && !mapp.user.roles.includes(negatedRole)) {

          // Merge the role object with the layer.
          mapp.utils.merge(layer, layer.roles[role]);
        }
      }
    }

    // Adjust infoj entries for user roles.
    layer.infoj?.filter(entry => typeof entry.roles === 'object').forEach(entry => {
      for (const role in entry.roles) {

        // Check if the role is an object
        if (typeof entry.roles[role] === 'object') {
          // Extract the role name from negated roles (e.g., "!admin" becomes "admin")
          const roleName = role.match(/(?<=^!)(.*)/g)?.[0];

          // Check if the role is included in 'mapp.user.roles'
          if (mapp.user.roles.includes(role)) {
            // Merge the role object with the entry
            mapp.utils.merge(entry, entry.roles[role]);
          }
          // Check if the negated role is not included in 'mapp.user.roles'
          else if (roleName && !mapp.user.roles.includes(roleName)) {
            // Merge the role object with the entry
            mapp.utils.merge(entry, entry.roles[role]);
          }
        }
      }
    });
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

  // Show the layer
  this.display = true;

  try {
    // Add layer to map
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

  // Hide the layer.
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

  // Return the current table if it exists.

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

function geomCurrent() {

  // Return the current table if it exists.

  // A layer must have either a table or tables configuration.
  if (!this.geoms) return this.geom;

  let geom;

  // Get current zoom level from mapview.
  const zoom = parseInt(this.mapview.Map.getView().getZoom());

  // Get zoom level keys from layer.tables object.
  const zoomKeys = Object.keys(this.geoms);

  // Get first zoom level key from array.
  const minZoomKey = parseInt(zoomKeys[0]);
  const maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

  // Get the table for the current zoom level.
  geom = this.geoms[zoom];

  // Get the first table if the current zoom level is smaller than the min.
  geom = zoom < minZoomKey ? this.geoms[minZoomKey] : geom;

  // Get the last table if the current zoom level is larger than the max.
  geom = zoom > maxZoomKey ? this.geoms[maxZoomKey] : geom;

  return geom;
}

function tableMax() {

  // Returns the max table

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table;

  // Return first value from (reversed) tables object which is not null.
  return Object.values(this.tables).reverse().find(val => !!val);
}

function tableMin() {

  // Returns the min table.

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table;

  // Return first value from tables object which is not null.
  return Object.values(this.tables).find(val => !!val);
}

async function zoomToExtent(params) {

  // Zooms to a specific extent

  // XMLHttpRequest to layer extent endpoint
  let response = await mapp.utils.xhr(`${this.mapview.host}/api/query/layer_extent?` +
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