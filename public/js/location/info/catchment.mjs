import _xyz from '../../_xyz.mjs';

export default (record, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });

  let td = _xyz.utils.createElement({
    tag: 'td',
    appendTo: tr,
    options: {
      colSpan: '2'
    }
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_wide cursor noselect',
      textContent: entry.value ? 'Delete' : 'Create'
    },
    appendTo: td,
    eventListener: {
      event: 'click',
      funct: e => {

        e.target.classList.add('disabled');

        entry.value ?
          deleteCatchment(record, entry) :
          createCatchment(record, entry);
      }
    }
  });
};

function createCatchment(record, entry) {

  entry.edit.catchment.coordinates = record.location.geometry.coordinates.join(',');

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/edit/catchment/create?' + _xyz.utils.paramString({
    locale: _xyz.locale,
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
    locale: _xyz.locale,
    layer: record.location.layer,
    table: record.location.table,
    field: entry.field,
    id: record.location.id,
    token: _xyz.token
  }));

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    // remove deleted catchment from map
    let i = record.location.geometries.indexOf(entry.edit.catchment.geometry);

    if (i > -1) record.location.geometries.splice(i, 1);

    _xyz.map.removeLayer(entry.edit.catchment.geometry);

    // Reset location infoj with response.
    record.location.infoj = JSON.parse(e.target.response);

    // Update the record.
    record.update();

    // Reload layer.
    _xyz.layers.list[record.location.layer].get();

  };

  xhr.send();

}