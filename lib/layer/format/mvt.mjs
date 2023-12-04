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

  layer.reload = () => {

    layer.source.clear()
    layer.source.refresh()
    layer.tilesLoaded = []
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
    tileUrlFunction
  })
 
  // Define source for mvt layer.
  layer.source = new ol.source.VectorTile({
    format: new ol.format.MVT(),
    transition: 0,
    cacheSize: 0,
    tileUrlFunction
  })

  function tileUrlFunction(tileCoord) {

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

    const url = `${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'mvt',
      z: tileCoord[0],
      x: tileCoord[1],
      y: tileCoord[2],
      locale: layer.mapview.locale.key,
      layer: layer.key,
      srid: layer.mapview.srid,
      table,
      geom,
      filter: layer.filter?.current,
      ...layer.params
    })}`

    return url
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