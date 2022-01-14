import select from './select.mjs'

import infotip from './infotip.mjs'

export default _xyz => layer => {

  layer.highlight = true

  layer.select = select(_xyz)

  layer.infotip = infotip(_xyz)

  layer.reload = () => {
    source.refresh()
  }

  const source = new ol.source.VectorTile({
    format: new ol.format.MVT(),
    transition: 0,
    cacheSize: 0,
    tileUrlFunction: tileCoord => {

      // Log(`tileUrlFunction - ${layer.key}:${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}`)

      const tableZ = layer.tableCurrent()

      if (!tableZ) return source.clear()

      const url = `${_xyz.host}/api/layer/mvt/${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}?` + _xyz.utils.paramString({
        locale: _xyz.locale.key,
        layer: layer.key,
        srid: _xyz.mapview.srid,
        table: tableZ,
        filter: layer.filter && layer.filter.current
      })

      return url
      
    }
  })

  layer.L = new ol.layer.VectorTile({
    source: source,
    renderBuffer: 200,
    zIndex: layer.style.zIndex || 1,
    style: _xyz.mapview.layer.styleFunction(layer)
  })

  layer.L.set('layer', layer, true)

  source.on('tileloaderror', e => console.log(e))

}