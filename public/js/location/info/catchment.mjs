export default (_xyz, record, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });

  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });

  _xyz.utils.createCheckbox({
    label: entry.name || 'Show additional geometries',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {
      e.target.checked ? e.target.parentNode.classList.add('changed') : e.target.parentNode.classList.remove('changed');
      e.target.checked ? createCatchment(record, entry) : deleteCatchment(record, entry);
    }
  });

  td = _xyz.utils.createElement({tag: 'td', appendTo: tr});


  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-circle'
    },
    style: {
      'backgroundColor': entry.style && entry.style.fillColor ? _xyz.utils.hexToRGBA(entry.style.fillColor || entry.style.color, entry.style.fillOpacity || 0.3) : _xyz.utils.hexToRGBA(entry.style ? entry.style.color : record.color, entry.style && entry.style.fillOpacity ? entry.style.fillOpacity : 0.3),
      'borderColor': entry.style && entry.style.color ? _xyz.utils.hexToRGBA(entry.style.color, entry.style.opacity ? entry.style.opacity : 1) : _xyz.utils.hexToRGBA(record.color, entry.style && entry.style.opacity ?  entry.style.opacity : 1),
      'borderStyle': 'solid',
      'borderWidth': _xyz.utils.setStrokeWeight(entry)
    },
    appendTo: td
  });


  function createCatchment(record, entry) {

    entry.edit.catchment.coordinates = record.location.geometry.coordinates.join(',');

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/edit/catchment/create?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: record.location.layer,
      table: record.location.table,
      field: entry.field,
      id: record.location.id,
      coordinates: entry.edit.catchment.coordinates,
      minutes: entry.edit.catchment.minutes,
      profile: entry.edit.catchment.profile,
      token: _xyz.token
    }));

    xhr.onload = e => {

      if (e.target.status === 406) return alert(e.target.responseText);

      if (e.target.status !== 200) return alert('No route found. Try a longer travel time.');

      // Reload layer.
      _xyz.layers.list[record.location.layer].get();

      // Reset location infoj with response.
      record.location.infoj = JSON.parse(e.target.response);

      // Update the record.
      record.update();

    };

    xhr.send();

  }

  function deleteCatchment(record, entry) {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/edit/catchment/delete?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: record.location.layer,
      table: record.location.table,
      field: entry.field,
      id: record.location.id,
      token: _xyz.token
    }));

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      // Reset location infoj with response.
      record.location.infoj = JSON.parse(e.target.response);

      // Update the record.
      record.update();

      // Reload layer.
      _xyz.layers.list[record.location.layer].get();

    };

    xhr.send();

  }

};