export default _xyz => {
  
  return layer => {
    
    if(!layer.display) layer.show();

    layer.header.classList.add('edited');
    _xyz.map_dom.style.cursor = 'crosshair';

    layer.edit.vertices = L.featureGroup().addTo(_xyz.map);

    _xyz.map.once('click', e => {

      const marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];
  
      // Add vertice from click.
      layer.edit.vertices.addLayer(
        L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
      );
  
      const xhr = new XMLHttpRequest();
  
      xhr.open('GET', _xyz.host + '/api/location/edit/draw/isoline?' + _xyz.utils.paramString({
        locale: _xyz.locale,
        layer: layer.key,
        table: layer.table,
        coordinates: [e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5)].join(','),
        mode: layer.edit.isoline.mode,
        type: layer.edit.isoline.type,
        rangetype: layer.edit.isoline.rangetype,
        traffic: null,
        range: layer.edit.isoline.range,
        token: _xyz.token
      }));
  
      xhr.onload = e => {

        console.log(e.target.responseText);
  
        _xyz.map_dom.style.cursor = '';
    
        //layer.get();
        layer.show();
    
        if (e.target.status !== 200) return alert('No route found. Try alternative set up.');
                                    
        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: e.target.response,
          marker: marker
        });
    
      };
  
      xhr.send();
      _xyz.state.finish();
      _xyz.map_dom.style.cursor = 'busy';
  
    });
  
  };
};