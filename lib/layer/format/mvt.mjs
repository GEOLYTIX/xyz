/**
### mapp.layer.formats.mvt()
This module defines the MVT (MapBox Vector Tile) format for map layers.
@module /layer/formats/mvt
*/

/**
 * Configures the MVT format for a map layer.
  @function mvt
  @param {Object} layer - The layer object.
  @param {string} [layer.srid='3857'] - The spatial reference system identifier (SRID) for the layer.
  @param {Object} [layer.style{}] - The style object for the layer.
  @param {Object} [layer.params{}] - Additional parameters for the layer.
  @param {Object} [layer.tables{}] - An object of zoom [key] and table [value] for the layer.
  @param {string[]} [layer.wkt_properties] - An array of properties to be retrieved as WKT (Well-Known Text) format.
  @param {number} [layer.transition] - The transition duration for the layer.
  @param {number} [layer.cacheSize] - The cache size for the layer.
  @param {Object} layer.mapview - The mapview object.
  @param {Object} layer.filter - The layer filter object.
  @param {function} layer.tableCurrent - A function that returns the current table for the layer.
  @param {function} layer.geomCurrent - A function that returns the current geometry for the layer.
  @param {ol.layer.VectorTile} layer.L - The OpenLayers vector tile layer.
  @returns {void}
 */
export default layer => {

  // Assign default SRID if nullish.
  layer.srid ??= '3857'

  // If 4326, return an error as this is not supported anymore. 
  if (layer.srid !== '3857') {
    console.warn(`Layer ${layer.key} must be set to use SRID 3857.`)
    return;
  }

  // Assign empty style object if nullish.
  layer.style ??= {}

  // Set default layer params if nullish.
  layer.params ??= {}

  if (layer.mvt_cache) {

    console.warn(`Layer ${layer.key} mvt_cache has been disabled.`)
  }

  // MVT query must not have a viewport, this is defined by the tile extent.
  delete layer.params.viewport

  // Assigns changeEnd event/method for zoom restricted layers.
  mapp.layer.changeEnd(layer)

  layer.reload = () => {

    if (layer.wkt_properties) {
      changeEndLoad(layer)
      return;
    }

    layer.source.clear()
    layer.source.refresh()
    layer.featureSource.refresh()
  }

  layer.clones = new Set()

  // The snapSource is required for snap interactions on vector tile layer.
  // The featureClasss is detrimental to the render performance.
  layer.featureSource = new ol.source.VectorTile({
    format: new ol.format.MVT({
      featureClass: ol.Feature,
      //idProperty: 'id'
    }),
    transition: 0,
    cacheSize: 0,
    tileUrlFunction: tileUrlFunction(layer)
  })

  // Define source for mvt layer.
  layer.source = new ol.source.VectorTile({
    format: new ol.format.MVT(),
    transition: layer.transition,
    cacheSize: layer.cacheSize
  })

  // Assign wkt properties load method.
  if (layer.wkt_properties) {
    layer.source.setTileUrlFunction(wktTileUrlFunction(layer))
    layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => changeEndLoad(layer));

  } else {

    layer.source.setTileUrlFunction(tileUrlFunction(layer))
  }

  layer.L = new ol.layer.VectorTile({
    key: layer.key,
    source: layer.source,
    renderBuffer: 200,
    //renderMode: 'vector',
    zIndex: layer.style?.zIndex || 1,
    style: mapp.layer.Style(layer)
  })
}

/**
 * Returns a function that generates the tile URL for a WKT-based layer.
 @function wktTileUrlFunction
 @param {Object} layer - The layer object.
 @param {string} layer.mapview.host - The host URL for the API.
 @param {Object} layer.mapview.locale - The locale object.
 @param {string} layer.mapview.locale.key - The key for the locale.
 @param {string} layer.mapview.srid - The SRID for the mapview.
 @param {string} layer.key - The key for the layer.
 @param {function} layer.tableCurrent - A function that returns the current table for the layer.
 @param {function} layer.geomCurrent - A function that returns the current geometry for the layer.
 @param {boolean} layer.display - A flag indicating whether the layer is displayed.
 @param {Set} [layer.clones] - A set of cloned layers.
 @param {ol.source.VectorTile} layer.source - The OpenLayers vector tile source.
 @returns {function} A function that generates the tile URL for the given tile coordinate.
 */
function wktTileUrlFunction(layer) {

  return tileCoord => {

    const table = layer.tableCurrent()

    // The layer has no data for this zoom level.
    if (!table) {
      layer.source.clear();
      return;
    }

    // The layer does not display and doesn't have clones.
    if (!layer.display && !layer.clones?.size) {
      layer.source.clear();
      return;
    }

    const geom = layer.geomCurrent()

    const url = `${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'mvt',
      z: tileCoord[0],
      x: tileCoord[1],
      y: tileCoord[2],
      locale: layer.mapview.locale.key,
      layer: layer.key,
      srid: layer.mapview.srid,
      table,
      geom
    })}`

    return url
  }
}

/**
 * Returns a function that generates the tile URL for an MVT layer.
 @function tileUrlFunction
 @param {Object} layer - The layer object.
 @param {string} layer.mapview.host - The host URL for the API.
 @param {Object} layer.mapview.locale - The locale object.
 @param {string} layer.mapview.locale.key - The key for the locale.
 @param {string} layer.key - The key for the layer.
 @param {function} layer.tableCurrent - A function that returns the current table for the layer.
 @param {function} layer.geomCurrent - A function that returns the current geometry for the layer.
 @param {boolean} layer.display - A flag indicating whether the layer is displayed.
 @param {Set} [layer.clones] - A set of cloned layers.
 @param {Object} [layer.params] - Additional parameters for the layer.
 @param {Object} [layer.style] - The style object for the layer.
 @param {Object} [layer.style.theme] - The theme style object.
 @param {string|string[]} [layer.style.theme.fields] - The field(s) for the theme style.
 @param {string} [layer.style.theme.field] - The field for the theme style.
 @param {Object} [layer.style.label] - The label style object.
 @param {string} [layer.style.label.field] - The field for the label style.
 @param {Object} [layer.filter] - The filter object for the layer.
 @param {function} [layer.filter.current] - The current filter function for the layer.
 @param {ol.source.VectorTile} layer.source - The OpenLayers vector tile source.
 @returns {function} A function that generates the tile URL for the given tile coordinate.
 */
function tileUrlFunction(layer) {

  return tileCoord => {

    const table = layer.tableCurrent()

    // The layer has no data for this zoom level.
    if (!table) {
      layer.source.clear();
      return;
    }

    // The layer does not display and doesn't have clones.
    if (!layer.display && !layer.clones?.size) {
      layer.source.clear();
      return;
    }

    const geom = layer.geomCurrent()

    // Create a set of feature properties for styling.
    layer.params.fields = [...new Set([
      Array.isArray(layer.style.theme?.fields) ?
        layer.style.theme.fields : layer.style.theme?.field,
      layer.style.theme?.field,
      layer.style.label?.field
    ].flat().filter(field => !!field))]

    const url = `${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'mvt',
      z: tileCoord[0],
      x: tileCoord[1],
      y: tileCoord[2],
      locale: layer.mapview.locale.key,
      layer: layer.key,
      table,
      geom,
      filter: layer.filter?.current,
      ...layer.params
    })}`

    return url
  }

}

/**
 * Loads the layer features and updates the layer display on map view change.
 @function changeEndLoad
 @param {Object} layer - The layer object.
 @param {XMLHttpRequest} [layer.xhr] - The XMLHttpRequest object used for fetching data.
 @param {function} layer.tableCurrent - A function that returns the current table for the layer.
 @param {boolean} layer.display - A flag indicating whether the layer is displayed.
 @param {Set} [layer.clones] - A set of cloned layers.
 @param {function} layer.geomCurrent - A function that returns the current geometry for the layer.
 @param {Object} [layer.params] - Additional parameters for the layer.
 @param {Object} [layer.style] - The style object for the layer.
 @param {Object} [layer.style.theme] - The theme style object.
 @param {string|string[]} [layer.style.theme.fields] - The field(s) for the theme style.
 @param {string} [layer.style.theme.field] - The field for the theme style.
 @param {Object} [layer.style.label] - The label style object.
 @param {string} [layer.style.label.field] - The field for the label style.
 @param {Object} layer.mapview - The mapview object.
 @param {string} layer.mapview.host - The host URL for the API.
 @param {Object} layer.mapview.locale - The locale object.
 @param {string} layer.mapview.locale.key - The key for the locale.
 @param {string} layer.mapview.srid - The SRID for the mapview.
 @param {ol.Map} layer.mapview.Map - The OpenLayers map object.
 @param {Object} layer.filter - The filter object for the layer.
 @param {function} [layer.filter.current] - The current filter function for the layer.
 @param {Object} [layer.featuresObject] - An object to store layer features.
 @param {ol.layer.VectorTile} layer.L - The OpenLayers vector tile layer.
 @returns {void}
 */
function changeEndLoad(layer) {

  layer.xhr?.abort()

  const table = layer.tableCurrent()

  if ((!table || !layer.display) && !layer.clones?.size) return layer.source.clear()

  const geom = layer.geomCurrent()

  // Create a set of feature properties for styling.
  layer.params.fields = [...new Set([
    Array.isArray(layer.style.theme?.fields) ?
      layer.style.theme.fields : layer.style.theme?.field,
    layer.style.theme?.field,
    layer.style.label?.field
  ].flat().filter(field => !!field))]

  const bounds = layer.mapview.getBounds()

  // Assign current viewport if queryparam is truthy.
  let viewport = [bounds.west, bounds.south, bounds.east, bounds.north, layer.mapview.srid];

  // Assign current viewport if queryparam is truthy.
  let z = layer.mapview.Map.getView().getZoom();

  layer.xhr = new XMLHttpRequest()

  layer.xhr.responseType = 'json'

  layer.xhr.onload = e => {

    layer.featuresObject = {}

    if (!e.target?.response) {
      layer.L.changed()
      return;
    }

    mapp.layer.featureFormats.wkt_properties(layer, e.target.response)

    layer.L.changed()
  }

  layer.xhr.open('GET', `${layer.mapview.host}/api/query?${mapp.utils.paramString({
    template: 'wkt',
    locale: layer.mapview.locale.key,
    layer: layer.key,
    table,
    geom,
    no_geom: true,
    viewport,
    z,
    filter: layer.filter?.current,
    ...layer.params
  })}`)

  layer.xhr.send()
}