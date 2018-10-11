import _xyz from '../_xyz.mjs';

export default location => {

  // Find free records in locations array.
  let freeRecords = _xyz.records.filter(record => !record.location);

  // Return from selection if no free record is available.
  if (freeRecords.length === 0) return;

  // Get layer from where the location should be selected.
  let layer = _xyz.layers[location.layer];

  // Prevent crash for select from hook when layer is no accessible to user.
  if (!layer) return;

  // Iterate through the layer infoj to find whether field require reference layer
  layer.infoj.forEach(entry => {
    if (typeof entry.layer === 'string') {
      entry.layer = {
        table: _xyz.layers[entry.layer].table,
        geom: _xyz.layers[entry.layer].geom || 'geom',
        filter: _xyz.layers[entry.layer].filter || {}
      };
    }
  });

  // fetch(_xyz.host + '/api/location/select?' + _xyz.utils.paramString({
  //     locale: _xyz.locale,
  //     layer: layer.key,
  //     table: location.table,
  //     id: location.id,
  //     token: _xyz.token
  // }))
  //     .then(res => {
  //         return res.json();
  //     })
  //     .then(loc => {
  //         console.log(loc);
  //     })
  //     .catch(err => console.error(err));

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/select?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: location.table,
    id: location.id,
    token: _xyz.token
  }));

  xhr.onload = e => {

    // remove wait cursor class if found
    let els = _xyz.map.getContainer().querySelectorAll('.leaflet-interactive.wait-cursor-enabled');
    for (let el of els) {
      el.classList.remove('wait-cursor-enabled');
    }

    if (e.target.status !== 200) return;

    let json = JSON.parse(e.target.responseText);

    location.geometry = JSON.parse(json.geomj);
    location.infoj = json.infoj;
    location.editable = layer.editable;
    location.geomdisplay = layer.geomdisplay ? JSON.parse(json.geomdisplay) : null;
    location.dbs = layer.dbs;
    location.qID = layer.qID;
    location.geom = layer.geom;

    // Log the location when logging is enabled.
    if (_xyz.log) console.log(location);
 
    // Set marker coordinates from point geometry.
    if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;

    // Add the location to the first free record.
    freeRecords[0].location = location;

    // Push the hook for the location.
    _xyz.utils.pushHook('select',
      freeRecords[0].letter + '!' +
        freeRecords[0].location.layer + '!' +
        freeRecords[0].location.table + '!' +
        freeRecords[0].location.id + '!' +
        freeRecords[0].location.marker[0] + ';' +
        freeRecords[0].location.marker[1]
    );
  
    // Draw the record to the map.
    _xyz.drawRecord(freeRecords[0]);

    // List the record
    _xyz.listRecord(freeRecords[0]);

  };

  xhr.send();
};