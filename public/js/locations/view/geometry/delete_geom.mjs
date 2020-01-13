export default _xyz => entry => {

  const xhr = new XMLHttpRequest();

  let meta = null;

  if(entry.edit){
    if(entry.edit.isoline_here && entry.edit.isoline_here.meta) meta = entry.edit.isoline_here.meta;
    if(entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.meta) meta = entry.edit.isoline_mapbox.meta;
  }

  xhr.open('GET', _xyz.host +
    '/api/location/edit/field/setnull?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer.key,
      table: entry.location.table,
      id: entry.location.id,
      fields: [entry.field, meta].join(","),
      token: _xyz.token
    })
  );

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) {
      entry.location.view && entry.location.view.classList.remove('disabled');
      console.log(_e.target.response);
      return alert('Something with saving isoline went wrong.');
    }

    Object.keys(e.target.response).forEach(key => {

      entry.location.infoj.forEach(_entry => {

        if (_entry.field === entry.field) _entry.display = false;
        if (_entry.field === key) _entry.value = e.target.response[key];
      });

    })

    // Update the location view.
    _xyz.locations.view.create(entry.location);

  };

  entry.location.view && entry.location.view.classList.add('disabled');
  xhr.send();
};