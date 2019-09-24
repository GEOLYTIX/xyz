export default _xyz => entry => {

  const origin = [
    entry.location.geometry.coordinates[1],
    entry.location.geometry.coordinates[0]
  ];

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
    '/api/location/edit/isoline/here/info?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer.key,
      table: entry.location.table,
      field: entry.field,
      id: entry.location.id,
      coordinates: origin.join(','),
      mode: entry.edit.isoline_here.mode,
      type: entry.edit.isoline_here.type,
      rangetype: entry.edit.isoline_here.rangetype,
      minutes: entry.edit.isoline_here.minutes,
      distance: entry.edit.isoline_here.distance,
      meta: entry.edit.isoline_here.meta || null,
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
      return alert('No route found. Try alternative set up.');
    }

    entry.location.infoj = e.target.response;

    //console.log(entry.location.infoj);

    // Update the location view.
    entry.location.view.update();

    // entry.location.flyTo();

  };

  xhr.send();

};