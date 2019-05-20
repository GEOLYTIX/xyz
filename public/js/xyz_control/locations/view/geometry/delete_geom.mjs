export default _xyz => entry => {

  const xhr = new XMLHttpRequest();

  let meta = (entry.edit && entry.edit.isoline_here && entry.edit.isoline_here.meta) ?  entry.edit.isoline_here.meta : null;

  xhr.open(
    'GET',
    _xyz.host + '/api/location/edit/field/setnull?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer,
      table: entry.location.table,
      id: entry.location.id,
      field: entry.field,
      meta: meta,
      token: _xyz.token
    })
  );

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    entry.location.infoj = JSON.parse(e.target.response);

    // Update the location view.
    entry.location.view.update();

  };

  xhr.send();
};