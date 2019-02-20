export default _xyz => (location, entry) => {

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host + '/api/location/setnull?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer,
      table: location.table,
      id: location.id,
      field: entry.field,
      token: _xyz.token
    })
  );

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    location.view.update(location);

  };

  xhr.send();
};