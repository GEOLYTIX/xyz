export default _xyz => layer => () => {

  // Return if layer should not be displayed.
  if (!layer.display) return;

  // Get table for the current zoom level.
  const tableZ = layer.tableCurrent();

  if (!tableZ) {

    // Remove existing layer from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);  

    return;
  }

  // Return from layer.get() if table is the same as layer table
  if (layer.table === tableZ && layer.L) return;

  // Set table to layer.table.
  layer.table = tableZ;

  // Show loader.
  if (layer.view.loader) layer.view.loader.style.display = 'block';

  const xhr = new XMLHttpRequest();   
        
  xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    cat: layer.style.theme && layer.style.theme.field,
    filter: JSON.stringify(layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current)),
    token: _xyz.token
  }));
  
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
  
  xhr.onload = e => {

    // Hide loader.
    if (layer.view.loader) layer.view.loader.style.display = 'none';

    // Remove layer from map if currently drawn.
    if (layer.L) _xyz.map.removeLayer(layer.L);
  
    if (e.target.status !== 200) return;

    const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

    const features = e.target.response.map(f => geoJSON.readFeature({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        id: f.properties.id
      }
    },{ 
      dataProjection: `EPSG:${layer.srid}`,
      featureProjection:'EPSG:3857'
    }));
  
    layer.L = new _xyz.mapview.lib.layer.Vector({
      source: new _xyz.mapview.lib.source.Vector({
        features: features
      }),
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

    _xyz.map.addLayer(layer.L);

    layer.L.set('layer',layer,true);
           
    // Check whether layer.display has been set to false during the drawing process and remove layer from map if necessary.
    if (!layer.display) _xyz.map.removeLayer(layer.L);
    
  };
      
  xhr.send();

};