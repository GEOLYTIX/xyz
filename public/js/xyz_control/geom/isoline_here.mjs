export default _xyz => layer => {
    
  if(!layer.display) layer.show();

  layer.view.header.classList.add('edited');
  _xyz.mapview.node.style.cursor = 'crosshair';

  layer.edit.vertices = L.featureGroup().addTo(_xyz.map);

  _xyz.map.once('click', e => {

    const origin = [e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5)];
  
    // Add vertice from click.
    layer.edit.vertices.addLayer(
      L.circleMarker(e.latlng, _xyz.style.defaults.vertex)
    );
  
    const xhr = new XMLHttpRequest();
  
    xhr.open(
      'GET',
      _xyz.host +
      '/api/location/edit/isoline/here?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: layer.table,
        coordinates: origin.join(','),
        mode: layer.edit.isoline_here.mode,
        type: layer.edit.isoline_here.type,
        rangetype: layer.edit.isoline_here.rangetype,
        //traffic: null,
        minutes: layer.edit.isoline_here.minutes,
        distance: layer.edit.isoline_here.distance,
        token: _xyz.token
      }));
  
    xhr.onload = e => {
  
      _xyz.mapview.node.style.cursor = '';

      layer.show();
        
      if (e.target.status !== 200) {
        console.log(e.target.response);
        return alert('No route found. Try alternative set up.');
      }

                                    
      _xyz.locations.select({
        layer: layer.key,
        table: layer.table,
        id: e.target.response,
        marker: origin.reverse(),
        edit: {delete: true}
      });
    
    };
  
    xhr.send();

    _xyz.mapview.state.finish();

    _xyz.mapview.node.style.cursor = 'busy';
  
  });
  
};