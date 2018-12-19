import _xyz from '../_xyz.mjs';

_xyz.locations.select = location => {

  const record = _xyz.locations.getFreeRecord();

  if (!record) return;

  record.location = location;

  // Get layer from where the location should be selected.
  let layer = _xyz.layers.list[location.layer];

  // Prevent crash for select from hook when layer is no accessible to user.
  if (!layer) return;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/select/id?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: location.table,
    id: location.id,
    token: _xyz.token
  }));

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    let json = JSON.parse(e.target.responseText);

    location.geometry = JSON.parse(json.geomj);
    location.infoj = json.infoj;
    location.edit = layer.edit;
    location.dbs = layer.dbs;
    location.qID = layer.qID;
    location.geom = layer.geom;

    // Log the location when logging is enabled.
    if (_xyz.log) console.log(location);
 
    // Set marker coordinates from point geometry.
    if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;

    // Push the hook for the location.
    _xyz.hooks.push('select',
      record.location.layer + '!' +
      record.location.table + '!' +
      record.location.id + '!' +
      record.location.marker[0] + ';' +
      record.location.marker[1]
    );
  
    // Draw the record to the map.
    _xyz.locations.draw(record);

    // List the record
    _xyz.locations.add(record);

  };

  xhr.send();
};