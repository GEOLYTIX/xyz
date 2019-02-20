export default _xyz => (location, entry) => {

  entry.edit.catchment.coordinates = location.geometry.coordinates.join(',');

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/catchment/create?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer,
      table: location.table,
      field: entry.field,
      id: location.id,
      coordinates: entry.edit.catchment.coordinates,
      minutes: entry.edit.catchment.minutes,
      profile: entry.edit.catchment.profile,
      token: _xyz.token
    })
  );

  xhr.onload = e => {

    if (e.target.status === 406) return alert(e.target.responseText);

    if (e.target.status !== 200) return alert('No route found. Try a longer travel time.');

    // Reload layer.
    _xyz.layers.list[location.layer].get();

    // Reset location infoj with response.
    location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    location.view.update();

  };

  xhr.send();

};