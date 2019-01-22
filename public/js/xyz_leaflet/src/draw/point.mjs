// import stage from './stage.mjs';

export default _xyz => {

  return layer => {
    
    if(!layer.display) layer.show();
    
    layer.header.classList.add('edited');
    _xyz.map_dom.style.cursor = 'crosshair';
    
    layer.edit.vertices = _xyz.L.featureGroup().addTo(_xyz.map);
    
    _xyz.map.on('click', e => {

      let marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];

      layer.edit.vertices.clearLayers();

      // Add vertice from click.
      layer.edit.vertices.addLayer(
        _xyz.L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
      );
      // .bindPopup(stage(_xyz, layer, marker), {
      //   closeButton: false
      // })
      // .openPopup();
        

      // Use right click context menu to upload polygon.
      _xyz.map.on('contextmenu', () => {
                         
        const xhr = new XMLHttpRequest();
        xhr.open('POST', _xyz.host + '/api/location/edit/draw?token=' + _xyz.token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = e => {
    
          if (e.target.status !== 200) return;
                  
          layer.loaded = false;
          layer.get();
                  
          // Select polygon when post request returned 200.
          _xyz.locations.select({
            layer: layer.key,
            table: layer.table,
            id: e.target.response,
            marker: marker,
            edit: layer.edit
          });
    
        };
          
        // Send path geometry to endpoint.
        xhr.send(JSON.stringify({
          locale: _xyz.locale,
          layer: layer.key,
          table: layer.table,
          geometry: {
            type: 'Point',
            coordinates: marker
          }
        }));
    
        _xyz.state.finish();
    
      }); 

    });
  
  };

};