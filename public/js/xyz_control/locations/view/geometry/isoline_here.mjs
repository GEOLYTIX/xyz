export default _xyz => (location, entry) => {

  const origin = [
    location.geometry.coordinates[1],
    location.geometry.coordinates[0]
  ].join(',');

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/isoline/here?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer,
      table: location.table,
      field: entry.field,
      id: location.id,
      coordinates: origin,
      mode: entry.edit.isoline.mode,
      type: entry.edit.isoline.type,
      rangetype: entry.edit.isoline.rangetype,
      range: entry.edit.isoline.range,
      token: _xyz.token
    })
  );

  xhr.onload = e => {

    if (e.target.status === 406) return alert(e.target.responseText);
      
    if (e.target.status !== 200) return alert('No route found. Try alternative set up.');

    // Reload layer.
    _xyz.layers.list[location.layer].get();

    // Reset location infoj with response.
    location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    location.view.update(location);

  };

  xhr.send();

};