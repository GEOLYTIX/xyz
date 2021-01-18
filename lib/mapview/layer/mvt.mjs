import select from './select.mjs';

import infotip from './infotip.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {


    if (layer.style.theme && layer.style.theme.dynamic) {

      _xyz.map.once('rendercomplete', renderComplete)
    }

    //source.tileCache.expireCache();
    //source.tileCache.clear();
    source.clear();
    source.refresh({force: true});
  };

  // Define source for mvt layer.
  const source = new ol.source.VectorTile({
    format: new ol.format.MVT({
      //featureClass: ol.Feature
    }),
    transition: 0,
    //cacheSize: 1,
    tileUrlFunction: tileCoord => {

      const tableZ = layer.tableCurrent();

      if (!tableZ) return source.clear();

      //console.log(`${layer.key}:${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}`)

      const url = `${_xyz.host}/api/layer/mvt/${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}?` + _xyz.utils.paramString({
        locale: _xyz.locale.key,
        srid: _xyz.mapview.srid,
        layer: layer.key,
        table: tableZ,
        filter: layer.filter && layer.filter.current
      });

      return url;
      
    }
  });

  layer.L = new ol.layer.VectorTile({
    source: source,
    renderBuffer: 200,
    declutter: false,
    //renderMode: 'vector',
    zIndex: layer.style.zIndex || 1,
    style: styleFn
  });

  _xyz.map && _xyz.map.on('movestart', () => {
    layer.moveStart = true
  })

  const mySet = new Set()
  const myTiles = {}

  source.on('tileloadstart', e => {

    console.log(e.tile.tileCoord.join('-'))

    myTiles[e.tile.tileCoord.join('-')] = Date.now()

    if (layer.style.theme && layer.style.theme.dynamic && layer.moveStart) {

      delete layer.moveStart
      layer.L.setStyle(addFeature)
      layer.style.features = []
      layer.style.featuresB = []
      _xyz.map.once('rendercomplete', renderComplete)
    }

  })

  source.on('tileloadend', e => {

    const myTile = e.tile.tileCoord.join('-')

    console.log(`${myTile} ${Math.abs(myTiles[myTile] - Date.now())}`)
  });

  function renderComplete() {
    if (layer.style.features.length) {
      const series = new geostats(layer.style.features)
      const seriesB = new geostats(layer.style.featuresB)
      //console.log(`Min ${series.min()} Max ${series.max()}`)
      layer.style.theme.series_max = seriesB.max()
      layer.style.theme.series = series[layer.style.theme.geostat](layer.style.theme.cat_arr.length)
      layer.L.setStyle(styleFn)
    }
  }

  function addFeature(feature) {
    
    const val = feature.get(layer.style.theme.field)
    
    val && layer.style.features.push(val)

    const size = feature.get('pop__01')
    
    size && layer.style.featuresB.push(size)

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#333',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: _xyz.utils.Chroma('#fff').alpha(0).rgba()
      }),
      image: layer.style.marker && _xyz.mapview.icon(layer.style.marker)
    })
  }

  const styleMap = new Map()

  function styleMem(styleStr) {

    if (styleMap.has(styleStr)) return styleMap.get(styleStr)

    const style = JSON.parse(styleStr)

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

    styleMap.set(styleStr, olStyle)

    return olStyle
  }

  function styleFn(feature) {

    //console.log(feature)

    const style = Object.assign(
      {},
      layer.style.default,
    );
  
    const theme = layer.style.theme;

    feature.get('strokecolor') && (style.strokeColor = feature.get('strokecolor'));

    // Categorized theme.
    if (theme && theme.type === 'categorized') {

      const field = feature.get(theme.field);

      field && Object.assign(
        style,
        (theme.cat[field] && theme.cat[field].style) || theme.cat[field]);
    }

    // Graduated theme.
    if (theme && theme.type === 'graduated' && theme.cat_arr) {
 
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
        Object.assign(style, cat_style);
      }
  
    }

    // Dynamic theme.
    if (theme && theme.dynamic && theme.cat_arr) {

      const value = parseFloat(feature.get(theme.field));

      if (value || value === 0) {

        // Iterate through cat array.
        for (let i = 0; i < theme.series.length - 1; i++) {

          // Set cat_style to current cat style after value check.
          var cat_style = theme.cat_arr[i].style || theme.cat_arr[i];

          // Break iteration is cat value is below current cat array value.
          if (value < theme.series[i+1]) break;

        }

        // Assign style from base & cat_style.
        Object.assign(style, cat_style);
      }

    }

    Object.assign(
      style,
      layer.highlight === feature.get('id') ? layer.style.highlight : {},
      layer.highlight === feature.get('id') ? {zIndex : 30} : {zIndex : 10},
    );

    let _scale = parseFloat(feature.get('pop__01'))

    if (_scale > 0 && layer.style.theme.series_max) {

      style.marker.scale = 0.4 + (0.4 * _scale / layer.style.theme.series_max)

    }

  
    return styleMem(JSON.stringify(style))

    // return new ol.style.Style({
    //   zIndex: style.zIndex,
    //   stroke: style.strokeColor && new ol.style.Stroke({
    //     color: _xyz.utils.Chroma(style.strokeColor).alpha(style.strokeOpacity === undefined ? 1 : parseFloat(style.strokeOpacity) || 0).rgba(),
    //     width: parseFloat(style.strokeWidth) || 1
    //   }),
    //   fill: style.fillColor && new ol.style.Fill({
    //     color: _xyz.utils.Chroma(style.fillColor).alpha(style.fillOpacity === undefined ? 1 : parseFloat(style.fillOpacity) || 0).rgba()
    //   }),
    //   image: style.marker && _xyz.mapview.icon(style.marker)
    // })

  }

  layer.L.set('layer', layer, true);

  layer.label = _xyz.mapview.layer.mvtLabel(layer);

};