import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default function(){

  const layer = this;
  layer.loaded = false;

  // Set locale to check whether locale is still current when data is returned from backend.
  const locale = _xyz.locale;
  
  if(!layer.table || !layer.display)  return _xyz.layers.check(layer);
    
  const xhr = new XMLHttpRequest(); 

  // Build xhr request.
  const bounds = _xyz.map.getBounds();     
  
  // Create filter from legend and current filter.
  const filter = Object.assign({},layer.filter.legend, layer.filter.current);
    
  xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    cat: layer.style.theme && layer.style.theme.field,
    filter: JSON.stringify(filter),
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  }));

  // Draw layer on load event.
  xhr.onload = e => {

    if (e.target.status !== 200 || !layer.display || locale !== _xyz.locale) return;
      
    // Create feature collection for vector features.
    const features = JSON.parse(e.target.responseText);

    // Check for existing layer and remove from map.
    if (layer.L) _xyz.map.removeLayer(layer.L);

    // Create cat array for graduated theme.
    if (layer.style.theme) layer.style.theme.cat_arr = Object.entries(layer.style.theme.cat);

    // Add geoJSON feature collection to the map.
    layer.L = L.geoJSON(features, {
      style: applyLayerStyle,
      pane: layer.key,
      interactive: layer.infoj? true: false,
      pointToLayer: function(point, latlng){
        return L.circleMarker(latlng, {
          radius: 9,
          pane: layer.key
        });
      }
    })
      .on('click', function(e){
        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: e.layer.feature.properties.id,
          marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)],
          editable: layer.edit ? layer.edit.properties : false
        });
      })
      .on('mouseover', function(e){
        e.layer.setStyle(layer.style.highlight);
      })
      .on('mouseout', function(e){
        e.layer.setStyle(applyLayerStyle(e.layer.feature));
      })
      .addTo(_xyz.map);

    _xyz.layers.check(layer);

    // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
    if (!layer.table || !layer.display) _xyz.map.removeLayer(layer.L);
  
  };
    
  xhr.send();

    
  function applyLayerStyle(feature){

    // Return default style if no theme is set on layer.
    if (!layer.style.theme) return layer.style.default;

    const theme = layer.style.theme;

    // Categorized theme.
    if (theme.type === 'categorized') {

      return Object.assign({}, layer.style.default, theme.cat[feature.properties.cat] || {});
    
    }

    // Graduated theme.
    if (theme.type === 'graduated') {

      theme.cat_style = {};
    
      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {
    
        // Break iteration is cat value is below current cat array value.
        if (parseFloat(feature.properties.cat) < parseFloat(theme.cat_arr[i][0])) break;
    
        // Set cat_style to current cat style after value check.
        theme.cat_style = theme.cat_arr[i][1];
    
      }
    
      // Assign style from base & cat_style.
      return Object.assign({}, layer.style.default, theme.cat_style);
    
    }
    
  }
}