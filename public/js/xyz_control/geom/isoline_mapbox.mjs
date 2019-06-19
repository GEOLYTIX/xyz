export default _xyz => layer => {
   
  layer.view.header.classList.add('edited');
  _xyz.mapview.node.style.cursor = 'crosshair';

  layer.edit.vertices = _xyz.mapview.lib.featureGroup().addTo(_xyz.map);

  _xyz.map.once('click', e => {

    const origin = [
      e.latlng.lng.toFixed(5),
      e.latlng.lat.toFixed(5)
    ];
                
    const xhr = new XMLHttpRequest();
  
    xhr.open(
      'GET',
      _xyz.host +
      '/api/location/edit/isoline/mapbox?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: layer.table,
        coordinates: origin.join(','),
        minutes: layer.edit.isoline_mapbox.minutes,
        profile: layer.edit.isoline_mapbox.profile,
        token: _xyz.token
      }));

    xhr.onload = e => {

      _xyz.mapview.node.style.cursor = '';

      layer.show();

      if (e.target.status !== 200) return alert('No route found. Try a longer travel time');
                                
      _xyz.locations.select({
        layer: layer.key,
        table: layer.table,
        id: e.target.response,
        marker: origin,
        edit: {delete: true}
      });

    };

    xhr.send();

    _xyz.mapview.state.finish();
    
    _xyz.mapview.node.style.cursor = 'busy';

  });
  
};