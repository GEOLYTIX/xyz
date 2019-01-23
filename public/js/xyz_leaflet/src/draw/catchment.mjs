export default _xyz => {

  return layer => {

    if(!layer.display) layer.show();
    
    layer.header.classList.add('edited');
    _xyz.map_dom.style.cursor = 'crosshair';

    layer.edit.vertices = _xyz.L.featureGroup().addTo(_xyz.map);

    _xyz.map.once('click', e => {

      const marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];
        
      // Add vertice from click.
      layer.edit.vertices.addLayer(
        _xyz.L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
      );
        
      const xhr = new XMLHttpRequest();
  
      xhr.open('GET', _xyz.host + '/api/location/edit/draw/catchment?' + _xyz.utils.paramString({
        locale: _xyz.locale,
        layer: layer.key,
        table: layer.table,
        coordinates: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)].join(','),
        minutes: layer.edit.catchment.minutes,
        profile: layer.edit.catchment.profile,
        token: _xyz.token
      }));

      xhr.onload = e => {

        _xyz.map_dom.style.cursor = '';

        layer.loaded = false;
        //layer.get();
        layer.show();

        if (e.target.status !== 200) return alert('No route found. Try a longer travel time');
                                
        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: e.target.response,
          marker: marker,
          edit: layer.edit
        });

      };

      xhr.send();

      _xyz.state.finish();
    
      _xyz.map_dom.style.cursor = 'busy';

    });
  
  };

};