export default _xyz => function (callback) {

  const location = this;

  const newValues = location.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .map(entry => ({
        field: entry.field,
        newValue: entry.newValue,
        type: entry.type
    }));

  if (!newValues.length) return;


  location.view && location.view.classList.add('disabled');

  // location.tables.forEach(table => _xyz.dataview.removeTab(table));

  const xhr = new XMLHttpRequest();

  xhr.open('POST', _xyz.host + 
    '/api/location/edit/update?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer.key,
      table: location.table,
      id: location.id,
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) return console.log(e.target.response);

    location.infoj = location.layer.infoj.map(entry => {
      entry.label = e.target.response[entry.field + '_label'] || entry.label;
      entry.value = e.target.response[entry.field];
      return entry;
    });

    // Recreate existing location view.
    location.view && _xyz.locations.view.create(location);

    // Reload layer.
    location.layer.reload();

    if (callback) callback();
  };

  xhr.send(JSON.stringify({
    infoj: newValues
  }));

};