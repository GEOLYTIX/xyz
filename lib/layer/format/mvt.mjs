/**
### mapp.layer.formats.mvt()
This module defines the MVT (MapBox Vector Tile) format for map layers.

@requires /layer/styleParser
@requires /layer/changeEnd
@requires /layer/featureStyle

@module /layer/formats/mvt
*/

/**
@function MVT

@description
The MVT format method receives a JSON layer argument from the mapp.layer.decorator and assigns format specific functions to the layer object.

The SRID of an MVT layer must be 3857.

The MVT format method will call the styleParser to check the layer.style{} configuration.

A changeEnd() event method for the layer will be assigned to the mapview.Map target.

A layer.reload() method will be assigned to reload the layer data from rest.

A layer.featureSource will be assigned for feature geometries.

A layer.source will be assigned for render features.

@param {layer} layer JSON layer

@property {Object} [layer.params] Parameter for layer data queries.
@property {number} [layer.transition] The transition duration for the layer.
@property {boolean} [layer.wkt_properties] A flag whether feature properties should be loaded independent from MVT geometries.
@property {number} [layer.cacheSize] The cache size for the layer tiles.

@returns {layer} layer decorated with format methods.
*/

export default function MVT(layer) {

  // Assign default SRID if nullish.
  layer.srid ??= '3857'

  // If 4326, return an error as this is not supported anymore. 
  if (layer.srid !== '3857') {
    console.warn(`Layer ${layer.key} must be set to use SRID 3857.`)
    return;
  }

  // Update feature style config.
  mapp.layer.styleParser(layer)

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

  // The snapSource is required for snap interactions on vector tile layer.
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
    className: `mapp-layer-${layer.key}`,
    zIndex: layer.zIndex,
    source: layer.source,
    renderBuffer: 200,
    //renderMode: 'vector',
    style: mapp.layer.featureStyle(layer)
  })
}

/**
@function tileUrlFunction

@description
Returns a function that generates the tile URL to request an MVT tile with MVT geometries and properties required for theming.

@param {layer} layer A decorated format:mvt mapp layer.

@returns {function} A function that generates the tile URL for a given tile coordinate.
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
    if (!layer.display) {
      layer.source.clear();
      return;
    }

    const geom = layer.geomCurrent()

    // Create a set of feature properties for styling.
    layer.params.fields = [...new Set([
      layer.params.default_fields,
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
      layer: layer.Key || layer.key,
      table,
      geom,
      filter: layer.filter?.current,
      ...layer.params
    })}`

    return url
  }
}

/**
@function wktTileUrlFunction

@description
Returns a function that generates the tile URL to request an MVT tile with MVT geometries and ID only.

Feature properties will be requested independently.

@param {layer} layer A decorated format:mvt mapp layer.

@returns {function} A function that generates the tile URL for a given tile coordinate.
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
    if (!layer.display) {
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
      layer: layer.Key || layer.key,
      srid: layer.mapview.srid,
      table,
      geom
    })}`

    return url
  }
}

/**
@function changeEndLoad

@description
The changeEndLoad method triggers the loading of feature properties to be assigned to MVT features in tiles requested from the wktTileUrlFunction() method.

@param {layer} layer A decorated format:mvt mapp layer.
*/

function changeEndLoad(layer) {

  layer.xhr?.abort()

  const table = layer.tableCurrent()

  if ((!table || !layer.display)) {
    return layer.source.clear()
  }

  const geom = layer.geomCurrent()

  // Create a set of feature properties for styling.
  layer.params.fields = [...new Set([
    layer.params.default_fields,
    Array.isArray(layer.style.theme?.fields) ?
      layer.style.theme.fields : layer.style.theme?.field,
    layer.style.theme?.field,
    layer.style.label?.field,
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
    layer: layer.Key || layer.key,
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