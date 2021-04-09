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
      
      const { project, slug } = _xyz.workspace?.context || {};
      
      const url = `${_xyz.host}/api/layer/mvt/${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}?` + _xyz.utils.paramString({
        locale: _xyz.locale.key,
        layer: layer.key,
        srid: _xyz.mapview.srid,
        table: tableZ,
        filter: layer.filter && layer.filter.current,
        project,
        slug
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

    // _xyz.map.removeLayer(layer.L)
    // source.clear()
  })


  let timeout

  _xyz.map.on('moveend', e => {

    if (!layer.display) return

    if (!layer.tableCurrent()) return

    Log("moveend")

    // layer.L.setStyle(null)
    // _xyz.map.addLayer(layer.L)

    // timeout = setTimeout(()=>{

    //   layer.L.setStyle(styleFn)

    // },400)
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

    layer.L.setStyle(styleFn)
  
  }


  const memoizedStyles = new Map()

  function styleFn(feature) {

    //Log(feature)

    const style = Object.assign(
      {},
      layer.style.default,
    )


    layer.style.theme && layer.style.theme.type && themeStyle(layer.style.theme)

    function themeStyle(theme) {

      // Categorized theme.
      if (theme && theme.type === 'categorized') {

        const field = feature.get(theme.field);

        field && _xyz.utils.merge(
          style,
          (theme.cat[field] && theme.cat[field].style) || theme.cat[field])
        
      }

      // Graduated theme.
      if (theme && theme.type === 'graduated') {
  
        const value = parseFloat(feature.get(theme.field));

        if (value || value === 0) {

          // Iterate through cat array.
          for (let i = 0; i < theme.cat_arr.length; i++) {

          // Break iteration is cat value is below current cat array value.
            if (value < theme.cat_arr[i].value) break;

            // Set cat_style to current cat style after value check.
            var cat_style = theme.cat_arr[i].style || theme.cat_arr[i];
          }

          // Assign style from base & cat_style.
          _xyz.utils.merge(style, cat_style)
        }
    
      }

      theme.theme && themeStyle(theme.theme)

    }

    // Assign highlight style.
    Object.assign(
      style,
      layer.highlight === feature.get('id') ? layer.style.highlight : {},
      layer.highlight === feature.get('id') ? {zIndex : 30} : {zIndex : 10},
    )

    // Check whether style is memoized.
    const styleStr = JSON.stringify(style)

    if (memoizedStyles.has(styleStr)) return memoizedStyles.get(styleStr)

    const olStyle = new ol.style.Style({
      zIndex: style.zIndex,
      stroke: style.strokeColor && new ol.style.Stroke({
        color: _xyz.utils.Chroma(style.strokeColor).alpha(style.strokeOpacity === undefined ? 1 : parseFloat(style.strokeOpacity) || 0).rgba(),
        width: parseFloat(style.strokeWidth) || 1
      }),
      fill: style.fillColor && new ol.style.Fill({
        color: _xyz.utils.Chroma(style.fillColor).alpha(style.fillOpacity === undefined ? 1 : parseFloat(style.fillOpacity) || 0).rgba()
      }),
      image: style.marker && _xyz.mapview.icon(style.marker)
    })

    memoizedStyles.set(styleStr, olStyle)

    return olStyle
  }

  layer.label = _xyz.mapview.layer.mvtLabel(layer)

}

// style = [...array].reverse().find(element => test > element.value) || array[0]