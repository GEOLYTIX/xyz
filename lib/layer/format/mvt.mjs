/**
### mapp.layer.formats.mvt()
This module defines the MVT (MapBox Vector Tile) format for map layers.

@requires /layer/styleParser
@requires /layer/featureStyle
@requires /layer/featureFormats

@module /layer/formats/mvt
*/

/**
@function MVT

@description
The MVT format method receives a JSON layer argument from the mapp.layer.decorator and assigns format specific functions to the layer object.

The SRID of an MVT layer must be 3857.

The MVT format method will call the styleParser to check the layer.style{} configuration.

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

  layer.reload = reload

  /**
  @function reload

  @description
  The reload method executes the wktPropertiesLoad method for MVT layer with wkt_properties features.

  Otherwise the source and featureSource [Openlayers VectorTile]{@link https://openlayers.org/en/latest/apidoc/module-ol_source_VectorTile.html} sources are cleared and refreshed.

  Finally the optional callback function param will be executed if provided.

  @param {Function} [callback] Optional callback function.
  */
  function reload(callback) {

    if (layer.wkt_properties) {
      wktPropertiesLoad(layer)
      return;
    }

    layer.source.clear()
    layer.source.refresh()

    layer.featureSource.refresh()

    if (callback instanceof Function) callback(layer)
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
    cacheSize: layer.cacheSize || 0
  })

  // Assign wkt properties load method.
  if (layer.wkt_properties) {
    layer.source.setTileUrlFunction(wktTileUrlFunction(layer))
    layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => wktPropertiesLoad(layer));

  } else if (layer.featureLookup) {
    layer.source.setTileUrlFunction(wktTileUrlFunction(layer))

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

    // Set request params.fields for styling.
    layer.params.fields = mapp.layer.featureFields.fieldsArray(layer)

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
@function wktPropertiesLoad

@description
The wktPropertiesLoad method send a query to the wkt template. The response is passed to the [featureFormats.wkt_properties]{@link module:/layer/featureFormats~wkt_properties} method.

Finally the layer.L.changed() method is called to trigger the [layer.featureStyle]{@link module:/layer/featureStyle~featureProperties} method which assigns feature properties from the layer.featuresObject.

@param {layer} layer A decorated format:mvt mapp layer.
*/
function wktPropertiesLoad(layer) {

  layer.xhr?.abort()

  const table = layer.tableCurrent()

  if ((!table || !layer.display)) {
    return layer.source.clear()
  }

  const geom = layer.geomCurrent()

  layer.params.fields = mapp.layer.featureFields.fieldsArray(layer)

  const bounds = layer.mapview.getBounds()

  // Assign current viewport if queryparam is truthy.
  const viewport = [bounds.west, bounds.south, bounds.east, bounds.north, layer.mapview.srid];

  // Assign current viewport if queryparam is truthy.
  const z = layer.mapview.Map.getView().getZoom();

  layer.xhr = new XMLHttpRequest()

  layer.xhr.responseType = 'json'

  layer.xhr.onload = e => {

    layer.featuresObject = {}

    if (!e.target?.response) {
      layer.L.changed()
      return;
    }

    // Set request params.fields for styling.
    mapp.layer.featureFormats.wkt_properties(layer, e.target.response)

    // Triggers the featureStyle method.
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
