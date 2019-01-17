export default _xyz => {

  return layer => {

    if(!layer.display) layer.show();

    layer.header.classList.add('edited');
    _xyz.map_dom.style.cursor = 'crosshair';

    layer.edit.vertices = _xyz.L.featureGroup().addTo(_xyz.map);
    layer.edit.trail = _xyz.L.featureGroup().addTo(_xyz.map);
    layer.edit.path = _xyz.L.featureGroup().addTo(_xyz.map);

    _xyz.map.on('click', e => {

    // Add vertice from click.
      layer.edit.vertices.addLayer(
        _xyz.L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
      );

      // Return trail on mousemove with first vertice.
      if (layer.edit.vertices.getLayers().length === 1) return _xyz.map.on('mousemove', e => {

        layer.edit.trail.clearLayers();

        let coords = [[e.latlng.lat, e.latlng.lng]];
        
        layer.edit.vertices.eachLayer(layer => {
          coords.push([layer.getLatLng().lat, layer.getLatLng().lng]);
        });
  
        layer.edit.trail.addLayer(
          _xyz.L.polygon(coords, _xyz.style.defaults.trail)
        );
  
      });

      if (layer.edit.vertices.getLayers().length < 3) return;

      // Create path polygon with 3 or more vertices.
                       
      layer.edit.path.clearLayers();

      let coords = [];
      
      layer.edit.vertices.eachLayer(layer => {
        coords.push([layer.getLatLng().lat, layer.getLatLng().lng]);
      });

      layer.edit.path.addLayer(
        _xyz.L.polygon(coords, _xyz.style.defaults.trail)
      );

      // Use right click context menu to upload polygon.
      _xyz.map.on('contextmenu', () => {
                
        let
          center = layer.edit.vertices.getBounds().getCenter(),
          marker = [center.lng.toFixed(5), center.lat.toFixed(5)];
      
        const xhr = new XMLHttpRequest();
        xhr.open('POST', _xyz.host + '/api/location/edit/draw?token=' + _xyz.token);
        xhr.setRequestHeader('Content-Type', 'application/json');
    
        xhr.onload = e => {

          if (e.target.status !== 200) return;

          layer.loaded = false;
          layer.get();
              
          // Select polygon when post request returned 200.
          _xyz.locations.select({
            locale: _xyz.locale,
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
          geometry: layer.edit.path.toGeoJSON().features[0].geometry
        }));

        _xyz.state.finish();

      }); 

    });

  };

};