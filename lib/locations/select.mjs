export default _xyz => location => {

  if (typeof location.layer === 'string') {

    location.layer = _xyz.layers.list[location.layer]

  }

  if (!location.layer) return;

  if (!location.layer.infoj) return;

  _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();

  location.hook = `${location.layer.key}!${location.table}!${location.id}`;

  let record = {stamp: parseInt(Date.now())};

  // Remove the location from record if it matches the current location.
  if (_xyz.locations.list.some(_record => {
    if (_record.location && _record.location.hook === location.hook) {
      _record.location.remove();
      _record.stamp = 0;
      return true;
    };
  })) return;

  // Find empty or oldest records.
  for (const _record of _xyz.locations.list) {

    if (!_record.location) {
      record = _record;
      break;
    } else if (_record.stamp < record.stamp) {
      record = _record;
    }
  }

  record.stamp = parseInt(Date.now());

  // Remove an existing location from record.
  record.location && record.location.remove();

  record.location = location;

  // Set record style to location.
  location.style = record.style;

  // Set record colorFilter to location.
  location.colorFilter = record.colorFilter;

  if (location._new) {

    _xyz.locations.decorate(location);

    location.marker = ol.proj.transform(
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

  record.location.xhr = xhr;

  xhr.open('GET', _xyz.host + '/api/location/get?' +
    _xyz.utils.paramString({
      locale: _xyz.locale.key,
      layer: location.layer.key,
      table: location.table,
      id: location.id
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status > 200) {
      //delete record.location;
      delete record.stamp;
      if (_xyz.hooks) _xyz.hooks.filter('locations', location.hook);
      return
    }

    // Push the hook for the location.
    if (_xyz.hooks) _xyz.hooks.push('locations', location.hook);

    const infoj = location.layer.infoj.map(_entry => {

      const entry = _xyz.utils.cloneDeep(_entry);
      entry.title = e.target.response.properties[entry.field + '_label'] || entry.title;
      entry.value = e.target.response.properties[entry.field];

      return entry;
    });

    _xyz.locations.decorate(
      location,
      {
        infoj: infoj,
        geometry: e.target.response.geometry,
        editable: (location.layer.edit),
        record: record
      });  

    location.marker = ol.proj.transform(
      _xyz.utils.turf.pointOnFeature(e.target.response.geometry).geometry.coordinates,
      'EPSG:' + location.layer.srid,
      'EPSG:' + _xyz.mapview.srid);

    // Return location callback if defined on location.
    if (typeof location.callback === 'function') return location.callback(location);

    // Use default locations select callback method.
    _xyz.locations.selectCallback(location);

  };

  xhr.send();

  record.location.remove = () => {
    record.location.xhr.abort();
    record.location = null;
  }

};