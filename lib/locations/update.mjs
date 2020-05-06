export default _xyz => function (callback) {

  const location = this;

  const newValues = {};
  
  location.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .forEach(entry => {
      Object.assign(newValues, { [entry.field] : entry.newValue })
    });

  if (!Object.keys(newValues).length) return;

  location.view && location.view.classList.add('disabled');

  const xhr = new XMLHttpRequest();

  xhr.open('POST', _xyz.host + 
    '/api/location/update?' +
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

    if (e.target.status !== 200) return console.error(e.target.response);

    const dependents = [];

    location.infoj
      .filter(entry => typeof entry.newValue !== 'undefined')
      .forEach(entry => {

        entry.dependents && entry.dependents.forEach(dependent => {
          if (location.infoj.some(entry => entry.field === dependent)) return dependents.push(dependent);
          location.infoj
            .filter(entry => entry.type === 'dataview')
            .forEach(entry => {
              if (entry.query === dependent && entry.update) return entry.update();
              entry.dataviews && entry.dataviews
                .filter(dataview => dataview.query === dependent)
                .forEach(dataview => dataview.update && dataview.update());
            });
        });

        entry.value = entry.newValue;
        delete entry.newValue;
      });

    if (dependents.length > 0) {

      const _xhr = new XMLHttpRequest();

      _xhr.open('GET', _xyz.host +
        '/api/location/get?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: location.layer.key,
          table: location.table,
          id: location.id,
          fields: dependents.join(),
          token: _xyz.token
        }));
    
      _xhr.setRequestHeader('Content-Type', 'application/json');
      _xhr.responseType = 'json';
    
      _xhr.onload = e => {

        location.infoj
          .filter(entry => typeof e.target.response[entry.field] !== 'undefined')
          .forEach(entry => {
            entry.value = e.target.response[entry.field];
          });

        // Recreate existing location view.
        location.view && _xyz.locations.view.create(location);

        // Reload layer.
        location.layer.reload();

        if (callback) callback();

      };
    
      _xhr.send();

      return
    }

    // Recreate existing location view.
    location.view && _xyz.locations.view.create(location);

    // Reload layer.
    location.layer.reload();

    if (callback) callback();

  };

  xhr.send(JSON.stringify(newValues));

};