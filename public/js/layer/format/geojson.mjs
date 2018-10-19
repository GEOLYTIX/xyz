import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default function(){

  const layer = this;
  layer.loaded = false;

  // Set locale to check whether locale is still current when data is returned from backend.
  const locale = _xyz.locale;
  
  // Request layer data when table and display are true.
  if(layer.table && layer.display){
    
    const xhr = new XMLHttpRequest(); 

    // Build xhr request.
    let bounds = _xyz.map.getBounds();      
    
    xhr.open('GET', _xyz.host + '/api/geojson/get?' + _xyz.utils.paramString({
      locale: _xyz.locale,
      layer: layer.key,
      table: layer.table,
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
      let features = JSON.parse(e.target.responseText);

      // Check for existing layer and remove from map.
      if (layer.L) _xyz.map.removeLayer(layer.L);

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
            editable: layer.editable
          });
        })
        .on('mouseover', function(e){
          e.layer.setStyle(layer.style.highlight);
        })
        .on('mouseout', function(e){
          e.layer.setStyle(layer.style.default);
        })
        .addTo(_xyz.map);

      _xyz.layers.check(layer);

      // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
      if (!layer.table || !layer.display) _xyz.map.removeLayer(layer.L);
  
    };
    
    xhr.send();
  }

  function applyLayerStyle(geojsonFeature){
    if (layer.style && layer.style.theme && layer.style.theme.type === 'categorized'){

      let val = geojsonFeature.properties[layer.style.theme.field] || null;

      if(val) return layer.style.theme.cat[val].style;

    }

    if (layer.style && layer.style.theme && layer.style.theme.type === 'graduated') {

      let style = layer.style.theme.cat[0].style;

      let val = geojsonFeature.properties[layer.style.theme.field] || null;

      for (let i = 0; i < layer.style.theme.cat.length; i++) {
        if (val && val < layer.style.theme.cat[i].val) break;
        style = layer.style.theme.cat[i].style;
      }
      return style;
    }
    return layer.style.default;
  }
}