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
    style: {
      margin: '3px 4px 3px -2px'
    },
    appendTo: td,
    eventListener: {
      event: 'click',
      funct: e => {
    
        e.target.classList.add('disabled');
    
        entry.value ?
          deleteIsoline(record, entry) :
          createIsoline(record, entry);
      }
    }
  });
};

function createIsoline(record, entry){
    
  entry.edit.isoline.coordinates = [record.location.geometry.coordinates[1],record.location.geometry.coordinates[0]].join(',');

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/edit/isoline/create?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: record.location.layer,
    table: record.location.table,
    field: entry.field,
    id: record.location.id,
    coordinates: entry.edit.isoline.coordinates,
    mode: entry.edit.isoline.mode,
    type: entry.edit.isoline.type,
    rangetype: entry.edit.isoline.rangetype,
    traffic: null,
    token: _xyz.token
  }));

  xhr.onload = e => {
    if (e.target.status === 406) return alert(e.target.responseText);
    if (e.target.status !== 200) return alert('No route found. Try alternative set up.');

    // Reload layer.
    _xyz.layers.list[record.location.layer].get();
        
    // Reset location infoj with response.
    record.location.infoj = JSON.parse(e.target.response);
        
    // Update the record.
    record.update();
  };
  xhr.send();
}

function deleteIsoline(record, entry){
    
  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/edit/isoline/delete?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: record.location.layer,
    table: record.location.table,
    field: entry.field,
    id: record.location.id,
    token: _xyz.token
  }));
  
  xhr.onload = e => {
  
    if (e.target.status !== 200) return;
  
    // remove deleted isoline from map
    let i = record.location.geometries.indexOf(entry.edit.isoline.geometry);
  
    if (i > -1) record.location.geometries.splice(i, 1);
  
    _xyz.map.removeLayer(entry.edit.isoline.geometry);
  
    // Reset location infoj with response.
    record.location.infoj = JSON.parse(e.target.response);
  
    // Update the record.
    record.update();
  
    // Reload layer.
    _xyz.layers.list[record.location.layer].get();
  
  };
  
  xhr.send();
}