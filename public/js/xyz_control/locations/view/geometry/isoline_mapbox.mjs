export default _xyz => entry => {

  const origin = entry.location.geometry.coordinates.join(',');

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/catchment/create?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer,
      table: entry.location.table,
      field: entry.field,
      id: entry.location.id,
      coordinates: origin,
      minutes: entry.edit.isoline.minutes,
      profile: entry.edit.isoline.profile,
      token: _xyz.token
    })
  );

  xhr.onload = e => {

    if (e.target.status === 406) return alert(e.target.responseText);

    if (e.target.status !== 200) return alert('No route found. Try a longer travel time.');

    // Reload layer.
    _xyz.layers.list[entry.location.layer].get();

    // Reset location infoj with response.
    entry.location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    entry.location.view.update();

    entry.location.flyTo();

  };

  xhr.send();

};