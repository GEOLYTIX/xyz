export default _xyz => layer => {

  // // Return if layer should not be displayed.
  // if (!layer.display || layer.L) return;

  // // Get table for the current zoom level.
  // const tableZ = layer.tableCurrent();

  // if (!tableZ) {

  //   // Remove existing layer from map.
  //   if (layer.L) _xyz.map.removeLayer(layer.L);  

  //   return;
  // }

  // // Return from layer.get() if table is the same as layer table
  // if (layer.table === tableZ && layer.L) return;

  // // Set table to layer.table.
  // layer.table = tableZ;

  // Define source for mvt layer.
  const source = new _xyz.mapview.lib.source.VectorTile({
    format: new _xyz.mapview.lib.format.MVT({
      //featureClass: _xyz.mapview.lib.Feature
    }),
    transition: 0,
    tileUrlFunction: tileCoord => {

      console.log(tileCoord);

      const tableZ = layer.tableCurrent();

      if (!tableZ) return;

      const url = _xyz.host + '/api/layer/mvt/'+tileCoord[0]+'/'+tileCoord[1]+'/'+ String(-tileCoord[2] - 1) +'?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: tableZ,
        properties: layer.properties,
        filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
        token: _xyz.token
      });

      return url;



    },
    // url: _xyz.host + '/api/layer/mvt/{z}/{x}/{y}?' + _xyz.utils.paramString({
    //   locale: _xyz.workspace.locale.key,
    //   layer: layer.key,
    //   table: layer.table,
    //   properties: layer.properties,
    //   filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
    //   token: _xyz.token
    // })
  });

  // Number of tiles currently loading.
  let tilesLoading = 0;

  // Increase the number of tiles loading at load start event.
  // Display loading indicator if it exists.
  source.on('tileloadstart', () => {
    tilesLoading++;
    if (layer.loader) layer.loader.style.display = 'block';
  });
  
  // Decrease the number of tiles loading at load end event.
  // Hide loading indicator if it exists.
  source.on('tileloadend', () => {
    tilesLoading--;
    if (layer.loader && tilesLoading === 0) layer.loader.style.display = 'none';
  });

  layer.L = new _xyz.mapview.lib.layer.VectorTile({
    source: source,
    zIndex: layer.style.zIndex || 1,
    style: feature => {

      const style = Object.assign(
        {},
        layer.style.default
      );
    
      const theme = layer.style.theme;
  
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
        stroke: new _xyz.mapview.lib.style.Stroke({
          color: style.color,
          width: style.weight
        }),
        fill: new _xyz.mapview.lib.style.Fill({
          color: _xyz.utils.hexToRGBA(style.fillColor, style.fillOpacity || 1, true)
        }),
        zIndex: style.zIndex,
        image: style.marker && _xyz.mapview.icon({url: _xyz.utils.svg_symbols(style.marker)})
      });
    }
  });

  // _xyz.map.addLayer(layer.L);

  layer.L.set('layer', layer, true);

};