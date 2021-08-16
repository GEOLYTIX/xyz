import select from './select.mjs'

import infotip from './infotip.mjs'

export default _xyz => layer => {

  layer.highlight = true

  layer.select = select(_xyz)

  layer.infotip = infotip(_xyz)

  layer.reload = () => {

    //source.clear()
    source.refresh()
  }

  let
    logging = false,
    lastPerformance = performance.now()

  // console.time(layer.key)

  function Log(msg) {
    if(!logging) return
    const perf = performance.now()
    console.log(`${perf - lastPerformance} | ${msg}`)
    lastPerformance = perf

    // console.timeLog(layer.key)
    // console.log(msg)
  }

  
  // Define source for mvt layer.
  const source = new ol.source.VectorTile({
    format: new ol.format.MVT({
      //featureClass: ol.Feature
    }),
    transition: 0,
    cacheSize: 0,
    tileUrlFunction: tileCoord => {

      Log(`tileUrlFunction - ${layer.key}:${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}`)

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
    //declutter: false,
    //renderMode: 'vector',
    zIndex: layer.style.zIndex || 1,
    style: null
  })

  layer.L.set('layer', layer, true)

  _xyz.map.on('movestart', e => {
    if (!layer.display) return

    Log('movestart')

    _xyz.map.removeLayer(layer.L)
    source.clear()
  })


  let timeout

  _xyz.map.on('moveend', e => {

    if (!layer.display) return

    if (!layer.tableCurrent()) return

    Log("moveend")

    layer.L.setStyle(null)

    _xyz.map.addLayer(layer.L)

    timeout = setTimeout(()=>{

      layer.L.setStyle(_xyz.mapview.layer.styleFunction(layer))

    },400)
  })

  const myTileSet = new Set()

  source.on('tileloaderror', e => {

    console.log(e)

  })

  source.on('tileloadstart', e => {

    timeout && clearTimeout(timeout)

    const tileCoord = e.tile.tileCoord.join('-')

    Log(tileCoord)

    myTileSet.add(tileCoord)
  })

  source.on('tileloadend', e => {

    const tileCoord = e.tile.tileCoord.join('-')

    Log(`tileloadend - ${tileCoord}`)

    myTileSet.delete(tileCoord)

    if (myTileSet.size === 0) tilesloaded()
  })

  function tilesloaded() {

    Log('tilesloaded')

    if (layer.style.theme && layer.style.theme.dynamic) {

      const view = _xyz.map.getView()
      const extent = view.calculateExtent()
      const features = source.getFeaturesInExtent(extent)

      Log(`${features.length || 0} Features loaded`)

      if (!features.length) return

      setSeries(layer.style.theme)

      function setSeries(theme) {

        const field = features.map(f => f.get(theme.field))

        const series = new geostats(field)
  
        const quantiles = series.getQuantile(theme.cat_arr.length)
  
        theme.cat_arr.forEach((c, i) => {
  
          c.value = quantiles[i]
  
        })

        theme.theme && setSeries(theme.theme)

      }

    }

    layer.L.setStyle(_xyz.mapview.layer.styleFunction(layer))
  
  }

}