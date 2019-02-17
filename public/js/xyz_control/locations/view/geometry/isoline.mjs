export default (_xyz, location, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: location.view.node });

  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });

  _xyz.utils.createCheckbox({
    label: entry.name || 'Additional geometries',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {
      e.target.checked ? e.target.parentNode.classList.add('changed') : e.target.parentNode.classList.remove('changed');
      e.target.checked ? createIsoline(location, entry) : deleteIsoline(location, entry);
    }
  });

  td = _xyz.utils.createElement({tag: 'td', appendTo: tr});

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-circle'
    },
    style: {
      'backgroundColor': _xyz.utils.hexToRGBA(location.style.fillColor, location.style.fillOpacity),
      'borderColor': _xyz.utils.hexToRGBA(location.style.color, location.style.fillOpacity),
      'borderStyle': 'solid',
      'borderWidth': _xyz.utils.setStrokeWeight(entry)
    },
    appendTo: td
  });

  function createIsoline(location, entry) {
    entry.edit.isoline.coordinates = [
      location.geometry.coordinates[1],
      location.geometry.coordinates[0]
    ].join(',');

    const xhr = new XMLHttpRequest();

    xhr.open(
      'GET',
      _xyz.host +
        '/api/location/edit/isoline/create?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: location.layer,
          table: location.table,
          field: entry.field,
          id: location.id,
          coordinates: entry.edit.isoline.coordinates,
          mode: entry.edit.isoline.mode,
          type: entry.edit.isoline.type,
          rangetype: entry.edit.isoline.rangetype,
          range: entry.edit.isoline.range,
          token: _xyz.token
        })
    );

    xhr.onload = e => {

      if (e.target.status === 406) return alert(e.target.responseText);
      
      if (e.target.status !== 200) return alert('No route found. Try alternative set up.');

      // Reload layer.
      _xyz.layers.list[location.layer].get();

      // Reset location infoj with response.
      location.infoj = JSON.parse(e.target.response);

      // Update the location view.
      location.view.update();

    };
    xhr.send();
  }

  function deleteIsoline(location, entry) {
    const xhr = new XMLHttpRequest();

    xhr.open(
      'GET',
      _xyz.host +
        '/api/location/edit/isoline/delete?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: location.layer,
          table: location.table,
          field: entry.field,
          id: location.id,
          token: _xyz.token
        })
    );

    xhr.onload = e => {
      if (e.target.status !== 200) return;

      location.infoj = JSON.parse(e.target.response);

      // Update the location view.
      location.view.update();

      // Reload layer.
      _xyz.layers.list[location.layer].get();
    };

    xhr.send();
  }
};
