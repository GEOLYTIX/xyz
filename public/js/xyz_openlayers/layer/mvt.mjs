import select from './select.mjs';

import infotip from './infotip.mjs';

import label from './mvtLabel.mjs';

export default _xyz => layer => {

  layer.highlight = true;

  layer.select = select(_xyz);

  layer.infotip = infotip(_xyz);

  layer.reload = () => {

    //source.tileCache.expireCache();
    //source.tileCache.clear();
    source.clear();
    source.refresh({force: true});
  };

  // Define source for mvt layer.
  const source = new _xyz.mapview.lib.source.VectorTile({
    format: new _xyz.mapview.lib.format.MVT({
      //featureClass: _xyz.mapview.lib.Feature
    }),
    transition: 0,
    tileUrlFunction: tileCoord => {

      const tableZ = layer.tableCurrent();

      if (!tableZ) return;

      //const url = _xyz.host + '/api/layer/mvt/'+tileCoord[0]+'/'+tileCoord[1]+'/'+ String(-tileCoord[2] - 1) +'?' + _xyz.utils.paramString({
      const url = _xyz.host + '/api/layer/mvt/'+tileCoord[0]+'/'+tileCoord[1]+'/'+ tileCoord[2] +'?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        mapview_srid: _xyz.mapview.srid,
        layer: layer.key,
        table: tableZ,
        properties: layer.properties,
        filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
        token: _xyz.token
      });

      return url;
      
    }
  });

  // Number of tiles currently loading.
  let tilesLoading = 0;

  // Increase the number of tiles loading at load start event.
  // Display loading indicator if it exists.
  source.on('tileloadstart', () => {
    tilesLoading++;
    if (layer.view.loader) layer.view.loader.style.display = 'block';
  });
  
  // Decrease the number of tiles loading at load end event.
  // Hide loading indicator if it exists.
  source.on('tileloadend', () => {
    tilesLoading--;
    if (layer.view.loader && tilesLoading === 0) layer.view.loader.style.display = 'none';
  });

  layer.L = new _xyz.mapview.lib.layer.VectorTile({
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const style = Object.assign(
        {},
        layer.style.default,
      );
    
      const theme = layer.style.theme;

      feature.get('strokecolor') && (style.strokeColor = feature.get('strokecolor'));

      // console.log(strokeColor);
  
      // Categorized theme.
      if (theme && theme.type === 'categorized') {
  
        Object.assign(
          style,
          theme.cat[feature.get(theme.field)].style || {}
        );
  
      }
  
      // Graduated theme.
      if (theme && theme.type === 'graduated' && theme.cat_arr) {
   
        const value = parseFloat(feature.get(theme.field));
  
        if (value) {

          // Iterate through cat array.
          for (let i = 0; i < theme.cat_arr.length; i++) {
  
          // Break iteration is cat value is below current cat array value.
            if (value < theme.cat_arr[i].value) break;
  
            // Set cat_style to current cat style after value check.
            var cat_style = theme.cat_arr[i].style;
          }
  
          // Assign style from base & cat_style.
          Object.assign(
            style,
            cat_style
          );

        }
    
      }

      Object.assign(
        style,
        layer.highlight === feature.get('id') ? layer.style.highlight : {},
        layer.highlight === feature.get('id') ? {zIndex : 30} : {zIndex : 10},
      );

      return new _xyz.mapview.lib.style.Style({
        zIndex: style.zIndex,
        stroke: style.strokeColor && new _xyz.mapview.lib.style.Stroke({
          color: style.strokeColor,
          width: parseInt(style.strokeWidth) || 1
        }),
        fill: style.fillColor && new _xyz.mapview.lib.style.Fill({
          color: _xyz.utils.Chroma(style.fillColor).alpha(style.fillOpacity === 0 ? 0 : parseFloat(style.fillOpacity) || 1).rgba()
        }),
        image: style.marker && _xyz.mapview.icon(style.marker)
      });
    }
  });

  layer.L.set('layer', layer, true);

  layer.label = label(_xyz, layer);

};