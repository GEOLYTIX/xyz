export default _xyz => {

  const defaultCallback = location => {

    if (_xyz.locations.listview.records) return _xyz.locations.listview.addRecord(location);

    // Make the location current.
    // To be removed when a new location is selected.
    _xyz.locations.current = location;

    // Get location marker from pointOnFeature is not already defined in location object.
    location.marker = location.marker
    || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;

    // Create location view.
    _xyz.locations.view(location);

    // Draw location to map.
    location.draw();

    // Create an alert with the locations infoj if mapview popup is not defined or the location does not have marker.
    if(!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
  
    // Create mapview popup with the locations view node.
    _xyz.mapview.popup({
      latlng: [location.marker[1], location.marker[0]],
      content: location.view.node
    });

  };
  
  return (_location, callback = defaultCallback) => {

    if (!_location) return;

    // Remove current location if it exists.
    if (_xyz.locations.current) _xyz.locations.current.remove();

    // Deselect location; Remove record from listview.
    if (
      _xyz.locations.listview && 
      _xyz.locations.listview.records && 
      _xyz.locations.listview.removeRecord(_location)) return;


    // Assign prototype to location.
    const location = _xyz.locations.location(_location);


    const xhr = new XMLHttpRequest();

    xhr.open(
      'GET',
      _xyz.host +
      '/api/location/select/id?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: location.layer,
        table: location.table,
        id: location.id,
        token: _xyz.token
      }));
  
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
  
    xhr.onload = e => {
  
      if (e.target.status !== 200) return;

      // Push the hook for the location.
      if (_xyz.hooks) _xyz.hooks.push(
        'locations', `${location.layer}!${location.table}!${location.id}`
      );

      location.infoj = e.target.response.infoj;
  
      location.geometry = e.target.response.geomj;

      callback(location);
     
    };
  
    xhr.send();

  };

};