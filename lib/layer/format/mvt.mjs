export default layer => {

  // Assign default SRID if nullish.
  layer.srid ??= '3857'

  // Assign empty style object if nullish.
  layer.style ??= {}

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

    const tableZ = layer.tableCurrent()

    if ((!tableZ || !layer.display) && !layer.clones?.size) return layer.source.clear()

    const url = `${layer.mapview.host}/api/layer/mvt/${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}?` + mapp.utils.paramString({
      locale: layer.mapview.locale.key,
      layer: layer.key,
      srid: layer.mapview.srid,
      table: tableZ,
      filter: layer.filter?.current
    })

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