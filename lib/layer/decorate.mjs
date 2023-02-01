import format from './format/_format.mjs'

export default async layer => {
  
  // Assign layer render.
  format[layer.format] && await format[layer.format](layer)
  
  Object.assign(layer, {
    show,
    showCallbacks: [],
    hide,
    hideCallbacks: [],
    tableCurrent,
    tableMax,
    tableMin,
    zoomToExtent,
  })

  // Set layer filter.
  layer.filter = Object.assign({
    current: {}
  }, layer.filter)

  // Set layer opacity from style.
  layer.style?.opacity && layer.L.setOpacity(layer.style.opacity)

  // Set the first theme from themes array as layer.style.theme
  if (layer.style && layer.style.themes) {

    // Assign / keep theme as is if type of object.
    layer.style.theme = typeof layer.style.theme === 'object' && layer.style.theme

      // Assign theme from themes if theme is key [string].
      || typeof layer.style.theme === 'string' && layer.style.themes[layer.style.theme]

      // Otherwise assign first theme from themes.
      || layer.style.themes[Object.keys(layer.style.themes)[0]];      
  }

  // Go through the layer keys to check for plugins.
  Object.keys(layer).forEach((key) => {
    mapp.layer[key] && mapp.layer[key](layer)
    mapp.plugins[key] && mapp.plugins[key](layer);
  });

  return layer
}

function show() {

  this.display = true

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L)

  // Add OL layer to mapview.
  this.mapview.Map.addLayer(this.L)

  // Reload layer data if available.
  typeof this.reload === 'function' && this.reload()

  // Add layer attribution to mapview attribution.
  this.mapview.attribution?.check()

  // Push the layer into the layers hook array.
  this.mapview.hooks && mapp.hooks.push('layers', this.key)

  // Execute showCallbacks
  this.showCallbacks?.forEach(fn => typeof fn === 'function' && fn(this))
}

function hide() {

  this.display = false

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L)

  // Remove layer attribution from mapview attribution.
  this.mapview.attribution?.check()

  // Filter the layer from the layers hook array.
  this.mapview.hooks && mapp.hooks.filter('layers', this.key)

  // Execute hideCallbacks
  this.hideCallbacks?.forEach(fn => typeof fn === 'function' && fn(this))
}

function tableCurrent() {

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table

  let
    table,

    // Get current zoom level from mapview.
    zoom = parseInt(this.mapview.Map.getView().getZoom()),


    // Get zoom level keys from layer.tables object.
    zoomKeys = Object.keys(this.tables),

    // Get first zoom level key from array.
    minZoomKey = parseInt(zoomKeys[0]),
    maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1])
     
  // Get the table for the current zoom level.
  table = this.tables[zoom]

  // Get the first table if the current zoom level is smaller than the min.
  table = zoom < minZoomKey ? this.tables[minZoomKey] : table

  // Get the last table if the current zoom level is larger than the max.
  table = zoom > maxZoomKey ? this.tables[maxZoomKey] : table

  return table
}

function tableMax() {

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table

  // Return first value from (reversed) tables object which is not null.
  return Object.values(this.tables).reverse().find(val => !!val)
}

function tableMin() {

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table

  // Return first value from tables object which is not null.
  return Object.values(this.tables).find(val => !!val)
}

async function zoomToExtent(params) {
  
  let response = await mapp.utils.xhr(`${this.mapview.host}/api/query/layer_extent?`+
    mapp.utils.paramString({
      dbs: this.dbs,
      locale: this.mapview.locale.key,
      layer: this.key,
      table: this.table || Object.values(this.tables)[0] || Object.values(this.tables)[1],
      geom: this.geom,
      proj: this.srid,
      srid: this.mapview.srid,
      filter: this.filter.current
    }))

  if (!response) {
    return false;
  }

  const bounds = /\((.*?)\)/.exec(response.box2d)[1].replace(/ /g, ',')

  this.mapview
    .fitView(bounds.split(',')
    .map(coords => parseFloat(coords)), params)

  return true;
}