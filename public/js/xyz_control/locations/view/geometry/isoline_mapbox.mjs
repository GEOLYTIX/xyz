export default _xyz => entry => {

  const origin = entry.location.geometry.coordinates;

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/isoline/mapbox/info?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer.key,
      table: entry.location.table,
      coordinates: origin.join(','),
      minutes: entry.edit.isoline_mapbox.minutes,
      profile: entry.edit.isoline_mapbox.profile,
      id: entry.location.id,
      field: entry.field,
      meta: entry.edit.isoline_mapbox.meta || null,
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status === 406) {
      //entry.location.view.update();
      return alert(e.target.responseText);
    }

    if (e.target.status !== 200) {
      console.log(e.target.response);
      //entry.location.view.update();
      return alert('No route found. Try a longer travel time.');
    }

    entry.location.infoj = e.target.response;

    //console.log(entry.location.infoj);

    // Update the location view.
    entry.location.view.update();

    //entry.location.flyTo();

  };

  xhr.send();

};