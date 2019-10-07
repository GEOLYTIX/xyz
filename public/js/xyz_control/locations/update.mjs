export default _xyz => function (callback) {

  const location = this;

  const xhr = new XMLHttpRequest();

  xhr.open(
    'POST', 
    _xyz.host + 
    '/api/location/edit/update?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer.key,
      table: location.table,
      id: location.id,
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = e => {

    if (e.target.status !== 200) return console.log(e.target.response);

    // Reset location infoj with response.
    location.infoj = JSON.parse(e.target.response);

    // Update the record.
    location.view.update();


    if (location.view.upload) location.view.upload.style.display = 'none';


    // Reload layer.
    location.layer.reload();

    if (callback) callback();

  };

  const infoj_newValues = location.infoj
    .filter(entry => (entry.newValue))
    .map(entry => {
      return {
        field: entry.field,
        newValue: entry.newValue,
        type: entry.type
      };
    });

  xhr.send(JSON.stringify({
    infoj: infoj_newValues
  }));

};