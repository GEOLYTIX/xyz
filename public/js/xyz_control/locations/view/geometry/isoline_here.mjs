export default _xyz => entry => {

  const origin = [
    entry.location.geometry.coordinates[1],
    entry.location.geometry.coordinates[0]
  ].join(',');

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/isoline/here?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer,
      table: entry.location.table,
      field: entry.field,
      id: entry.location.id,
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
    _xyz.layers.list[entry.location.layer].get();

    // Reset location infoj with response.
    entry.location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    entry.location.view.update();

  };

  xhr.send();

};