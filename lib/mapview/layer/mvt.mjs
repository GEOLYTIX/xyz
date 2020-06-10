import select from './select.mjs';

import infotip from './infotip.mjs';

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
  const source = new ol.source.VectorTile({
    format: new ol.format.MVT({
      //featureClass: ol.Feature
    }),
    transition: 0,
    tileUrlFunction: tileCoord => {

      const tableZ = layer.tableCurrent();

      if (!tableZ) return source.clear();

      //const url = _xyz.host + '/api/layer/mvt/'+tileCoord[0]+'/'+tileCoord[1]+'/'+ String(-tileCoord[2] - 1) +'?' + _xyz.utils.paramString({
      const url = `${_xyz.host}/api/layer/mvt/${tileCoord[0]}/${tileCoord[1]}/${tileCoord[2]}?` + _xyz.utils.paramString({
      //const url = _xyz.host + '/api/layer/mvt?' + _xyz.utils.paramString({
        // z: tileCoord[0],
        // x: tileCoord[1],
        // y: tileCoord[2],
        locale: _xyz.workspace.locale.key,
        srid: _xyz.mapview.srid,
        layer: layer.key,
        table: tableZ,
        filter: layer.filter && JSON.stringify(layer.filter.current)
      });

      return url;
      
    }
  });

  layer.L = new ol.layer.VectorTile({
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const style = Object.assign(
        {},
        layer.style.default,
      );
    
      const theme = layer.style.theme;

      feature.get('strokecolor') && (style.strokeColor = feature.get('strokecolor'));
  
      // Categorized theme.
      if (theme && theme.type === 'categorized') {

        const field = feature.get(theme.field);

        if(field === undefined) return Object.assign(style, {});
  
        Object.assign(
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

      Object.assign(
        style,
        layer.highlight === feature.get('id') ? layer.style.highlight : {},
        layer.highlight === feature.get('id') ? {zIndex : 30} : {zIndex : 10},
      );

      return new ol.style.Style({
        zIndex: style.zIndex,
        stroke: style.strokeColor && new ol.style.Stroke({
          color: _xyz.utils.Chroma(style.strokeColor).alpha(style.strokeOpacity === undefined ? 1 : parseFloat(style.strokeOpacity) || 0).rgba(),
          width: parseFloat(style.strokeWidth) || 1
        }),
        fill: style.fillColor && new ol.style.Fill({
          color: _xyz.utils.Chroma(style.fillColor).alpha(style.fillOpacity === undefined ? 1 : parseFloat(style.fillOpacity) || 0).rgba()
        }),
        image: style.marker && _xyz.mapview.icon(style.marker)
      });
    }
  });

  layer.L.set('layer', layer, true);

  layer.label = _xyz.mapview.layer.mvtLabel(layer);

};