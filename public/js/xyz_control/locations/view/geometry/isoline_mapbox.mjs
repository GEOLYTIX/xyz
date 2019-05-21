export default _xyz => entry => {

  const origin = entry.location.geometry.coordinates;

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/isoline/mapbox?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer,
      table: entry.location.table,
      coordinates: origin.join(','),
      minutes: entry.edit.isoline_mapbox.minutes,
      profile: entry.edit.isoline_mapbox.profile,
      id: entry.location.id,
      field: entry.field,
      meta: entry.edit.isoline_mapbox.meta || null,
      token: _xyz.token
    }));

  xhr.onload = e => {

    if (e.target.status === 406) {
      entry.location.view.update();
      return alert(e.target.responseText);
    }

    if (e.target.status !== 200) {
      entry.location.view.update();
      return alert('No route found. Try a longer travel time.');
    }

    // Reset location infoj with response.
    entry.location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    entry.location.view.update();

    entry.location.flyTo();

  };

  xhr.send();

};