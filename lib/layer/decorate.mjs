/**
### mapp.layer.decorate()
Decorates a layer object with additional properties and methods.

A mapview must be assigned to the layer object in order to decorate a layer.

The layer decorator passes the layer to a defined format method which assigns the Openlayers layer object (L).

Common interface methods such as layer.show, and hide are assigned to the layer object.

A blank layer.filter object will be set if the filter has not been defined in the JSON layer.

The first theme from the layer.style.themes array will be assigned as layer.style.theme if not already set.

Any plugins matching layer keys will be executed with the layer being passed as argument to the plugin method.

The layer object is returned from the decorator.

@module /layer/decorate
*/

/**
@function decorator
@async

@description
The layer decorator method create mapp-layer typedef object from a json-layer.

@param {object} layer JSON layer.
@property {boolean} layer.featureLocation Locations will be gotten from layer.features.

@returns {layer} Decorated Mapp Layer.
*/
export default async function decorate(layer) {
  // Check layer format.
  if (!Object.hasOwn(mapp.layer.formats, layer.format)) {
    console.warn(`Layer: ${layer.key}; ${layer.format} format unavailable.`);
    return;
  }

  // Decorate layer format methods.
  await mapp.layer.formats[layer.format](layer);

  // If layer does not exist, return.
  if (!layer.L) return;

  // The layer may be zoom level restricted.
  if (layer.tables || layer.params?.viewport) {
    layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () =>
      changeEnd(layer),
    );
  }

  // Assign show, hide, and other methods to the layer object.
  Object.assign(layer, {
    show,
    showCallbacks: [],
    hide,
    hideCallbacks: [],
    tableCurrent,
    geomCurrent,
    zoomToExtent,
  });

  // Warn if outdated layer.edit configuration is used.
  // Set layer.draw to layer.edit if it exists.
  if (layer.edit) {
    console.warn(
      `Layer: ${layer.key}, please update edit:{} to use draw:{} as layer.edit has been superseeded with layer.draw to be in line with the OL drawing interaction.`,
    );
    layer.draw = Object.assign(layer.draw || {}, layer.edit);
  }

  // Layer must have an empty draw config to allow for role-based assignment of drawing methods.
  layer.draw ??= {};

  // Warn if outdated layer.draw.delete configuration is used.
  if (layer.draw?.delete) {
    console.warn(
      `Layer: ${layer.key}, please move draw.delete to use layer.deleteLocation:true.`,
    );
  }

  // Set layer filter.
  layer.filter = {
    current: {},
    ...layer.filter,
  };

  // Set layer opacity from style.
  layer.L.setOpacity(layer.style?.opacity || 1);

  // Check which infoj entries should be skipped.
  if (Array.isArray(layer.infoj_skip)) {
    layer.infoj
      .filter((entry) =>
        [entry.key, entry.field, entry.query, entry.type, entry.group]

          // Some object property value is included in infoj_skip array.
          .some((val) => layer.infoj_skip.includes(val)),
      )

      // Set skipEntry flag if some entry property is included in infoj_skip array.
      .forEach((entry) => (entry.skipEntry = true));
  }

  //Remove edit property from infoj entries on featureLocation layer.
  layer.featureLocation && layer?.infoj?.forEach((entry) => delete entry.edit);

  // Call layer and/or plugin methods.
  Object.keys(layer).forEach((key) => {
    typeof mapp.layer[key] === 'function' && mapp.layer[key]?.(layer);
    typeof mapp.plugins[key] === 'function' && mapp.plugins[key]?.(layer);
  });

  return layer;
}

/**
@function show

@description
Shows the layer on the map.
*/
function show() {
  // Push the layer into the layers hook array.
  this.mapview.hooks && mapp.hooks.push('layers', this.key);

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

  // Execute showCallbacks
  this.showCallbacks?.forEach((fn) => fn instanceof Function && fn(this));
}

/**
@function hide

@description
Hides the layer from the map.
*/
function hide() {
  this.display = false;

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L);

  // Remove layer attribution from mapview attribution.
  this.mapview.attribution?.check();

  // Filter the layer from the layers hook array.
  if (this.mapview.hooks && !this.zoomDisplay) {
    mapp.hooks.filter('layers', this.key);
  }

  // Execute hideCallbacks
  this.hideCallbacks?.forEach((fn) => fn instanceof Function && fn(this));
}

/**
@function tableCurrent

@description
Returns the current table associated with the layer.

@returns {string} The current table associated with the layer.
*/
function tableCurrent() {
  // Return the current table if it exists.
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

/**
@function geomCurrent

@description
Returns the current geometry associated with the layer.

@returns {string} The current geometry associated with the layer.
*/
function geomCurrent() {
  // Return the current geometry if it exists.
  if (!this.geoms) return this.geom;

  let geom;

  // Get current zoom level from mapview.
  const zoom = parseInt(this.mapview.Map.getView().getZoom());

  // Get zoom level keys from layer.tables object.
  const zoomKeys = Object.keys(this.geoms);

  // Get first zoom level key from array.
  const minZoomKey = parseInt(zoomKeys[0]);
  const maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

  // Get the geometry for the current zoom level.
  geom = this.geoms[zoom];

  // Get the first geometry if the current zoom level is smaller than the min.
  geom = zoom < minZoomKey ? this.geoms[minZoomKey] : geom;

  // Get the last geometry if the current zoom level is larger than the max.
  geom = zoom > maxZoomKey ? this.geoms[maxZoomKey] : geom;

  return geom;
}

/**
@function zoomToExtent
@async

@description
Zooms to a specific extent on the map.

@param {Object} params - Parameters for zooming to extent.
@returns {Promise<boolean>} A promise that resolves with a boolean indicating the success of the operation.
*/
async function zoomToExtent(params) {
  // Zooms to a specific extent.

  // XMLHttpRequest to layer extent endpoint
  const response = await mapp.utils.xhr(
    `${this.mapview.host}/api/query/layer_extent?` +
      mapp.utils.paramString({
        // build query string for the url
        locale: this.mapview.locale.key,
        layer: this.key,
        table:
          this.table ||
          Object.values(this.tables)[0] ||
          Object.values(this.tables)[1],
        geom: this.geom,
        proj: this.srid,
        srid: this.mapview.srid,
        filter: this.filter.current,
      }),
  );

  // If failed to fetch response
  if (!response) {
    return false;
  }

  // re matches text in parentheses
  const bounds = /\((.*?)\)/.exec(response.box2d)[1].replace(/ /g, ',');

  this.mapview.fitView(
    // fit the map view within bounds
    bounds.split(',').map(
      // get a float array of bounds
      (coords) => parseFloat(coords),
    ),
    params,
  );

  return true;
}

function changeEnd(layer) {
  // Layer is out of zoom range.
  if (!layer.tableCurrent()) {
    if (layer.display) {
      // Layer should be shown if possible.
      layer.zoomDisplay = true;
      layer.hide();
    }

    return;
  }

  if (layer.zoomDisplay) {
    // Prevents layer.show() being fired on zoom change within range.
    delete layer.zoomDisplay;

    // Show layer if within zoomDisplay range.
    layer.show();
  }

  if (layer.params.viewport) {
    layer.reload();
  }
}
