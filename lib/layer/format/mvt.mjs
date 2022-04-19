export default layer => {

  layer.reload = () => {

    //source.clear()
    source.refresh()
  }
  
  // Define source for mvt layer.
  const source = new ol.source.VectorTile({
    format: new ol.format.MVT({
      //featureClass: ol.Feature
      //idProperty: 'id'
    }),
    transition: 0,
    cacheSize: 0,
    tileUrlFunction: tileCoord => {

      const tableZ = layer.tableCurrent()

      if (!tableZ) return source.clear()

      const url = `${layer.mapview.host}/api/layer/mvt/${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}?` + mapp.utils.paramString({
        locale: layer.mapview.locale.key,
        layer: layer.key,
        srid: layer.mapview.srid,
        table: tableZ,
        filter: layer.filter && layer.filter.current
      })

      return url
      
    }
  })

  layer.L = new ol.layer.VectorTile({
    key: layer.key,
    source: source,
    renderBuffer: 200,
    //renderMode: layer.renderMode,
    zIndex: layer.style.zIndex || 1,
    style: mapp.layer.style(layer)
  })

}