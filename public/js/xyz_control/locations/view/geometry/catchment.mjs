export default (_xyz, location, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: location.view.node });

  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });

  _xyz.utils.createCheckbox({
    label: entry.name || 'Show additional geometries',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {
      e.target.checked ? e.target.parentNode.classList.add('changed') : e.target.parentNode.classList.remove('changed');
      e.target.checked ? createCatchment(location, entry) : deleteCatchment(location, entry);
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


  function createCatchment(location, entry) {

    entry.edit.catchment.coordinates = location.geometry.coordinates.join(',');

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/edit/catchment/create?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer,
      table: location.table,
      field: entry.field,
      id: location.id,
      coordinates: entry.edit.catchment.coordinates,
      minutes: entry.edit.catchment.minutes,
      profile: entry.edit.catchment.profile,
      token: _xyz.token
    }));

    xhr.onload = e => {

      if (e.target.status === 406) return alert(e.target.responseText);

      if (e.target.status !== 200) return alert('No route found. Try a longer travel time.');

      // Reload layer.
      _xyz.layers.list[location.layer].get();

      // Reset location infoj with response.
      location.infoj = JSON.parse(e.target.response);

      // Update the location view.
      location.view.update();

    };

    xhr.send();

  }

  function deleteCatchment(location, entry) {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/edit/catchment/delete?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: location.layer,
      table: location.table,
      field: entry.field,
      id: location.id,
      token: _xyz.token
    }));

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      // Reset location infoj with response.
      location.infoj = JSON.parse(e.target.response);

      // Update the location view.
      location.view.update();

      // Reload layer.
      _xyz.layers.list[location.layer].get();

    };

    xhr.send();

  }

};