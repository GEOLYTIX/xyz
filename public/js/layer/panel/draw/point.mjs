import _xyz from '../../../_xyz.mjs';

import stage from './stage.mjs';

export default layer => {
    
  if(!layer.display) layer.show();
    
  layer.header.classList.add('edited');
  _xyz.dom.map.style.cursor = 'crosshair';
    
  layer.edit.vertices = L.featureGroup().addTo(_xyz.map);
    
  _xyz.map.on('click', e => {

    let marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];

    layer.edit.vertices.clearLayers();

    layer.edit.vertices.addLayer(
      L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
    )
      .bindPopup(stage(layer, marker), {
        closeButton: false
      })
      .openPopup();

  });
  
};