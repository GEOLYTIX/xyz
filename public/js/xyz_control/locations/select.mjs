export default _xyz => location => {

  location.hook = `${location.layer.key}!${location.table}!${location.id}`;

  let record = {stamp: parseInt(Date.now())};

  // Iterate through records in locations list
  if (_xyz.locations.list.some(_record => {

    if (!_record.location) {
      record = _record;
    } else if (_record.location && _record.stamp < record.stamp) {
      record = _record;
    }

    // Remove the location from record if it matches the current location.
    if (_record.location && _record.location.hook === location.hook) {

      _record.location.remove();
      _record.stamp = 0;

      // Return from select by returning true to some array method.
      return true;
    };

  })) return;

  // Remove an existing location from record.
  record.location && record.location.remove();

  // Set record style to location.
  location.style = record.style;

  // Assign location to record.
  record.location = location;

  record.location.record = record;

  // Set new stamp on record.
  record.stamp = parseInt(Date.now());

  if (location._new) {

    _xyz.locations.decorate(location);

    location.marker = _xyz.mapview.lib.proj.transform(
      _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
      'EPSG:' + location.layer.srid,
      'EPSG:' + _xyz.mapview.srid);

    // Return location callback if defined on location.
    if (typeof location.callback === 'function') return location.callback(location);

    // Use default locations select callback method.
    return _xyz.locations.selectCallback(location);
  }

  // Get location properties from XYZ host.
  const xhr = new XMLHttpRequest();

  xhr.open('GET',
    _xyz.host + '/api/location/select/id?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer.key,
      table: location.table,
      id: location.id,
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) {
      delete record.location;
      delete record.stamp;
      return console.error(e.target.statusText);
    }

    // Push the hook for the location.
    if (_xyz.hooks) _xyz.hooks.push('locations', location.hook);

    _xyz.locations.decorate(
      location,
      {
        infoj: e.target.response.infoj,
        geometry: e.target.response.geomj,
        editable: (location.layer.edit)
      });

    location.marker = _xyz.mapview.lib.proj.transform(
      e.target.response.pointonsurface,
      'EPSG:' + location.layer.srid,
      'EPSG:' + _xyz.mapview.srid);

    // Return location callback if defined on location.
    if (typeof location.callback === 'function') return location.callback(location);

    // Use default locations select callback method.
    _xyz.locations.selectCallback(location);

  };

  xhr.send();

};