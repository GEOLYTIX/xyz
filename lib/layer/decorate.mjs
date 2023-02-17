import format from './format/_format.mjs';

export default async layer => {
  
  // Assign layer render.
  format[layer.format] && await format[layer.format](layer);
  
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

  // Set layer filter.
  layer.filter = Object.assign({
    current: {}
  }, layer.filter);

  // Set layer opacity from style.
  layer.style?.opacity && layer.L.setOpacity(layer.style.opacity);

  // Set the first theme from themes array as layer.style.theme
  if (layer.style && layer.style.themes) {

    // Assign / keep theme as is if type of object.
    layer.style.theme = typeof layer.style.theme === 'object' && layer.style.theme

      // Assign theme from themes if theme is key [string].
      || typeof layer.style.theme === 'string' && layer.style.themes[layer.style.theme]

      // Otherwise assign first theme from themes.
      || layer.style.themes[Object.keys(layer.style.themes)[0]];      
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