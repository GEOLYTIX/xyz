import _xyz from '../_xyz.mjs';
import Tabulator from 'tabulator-tables';

export default (layer, el) => {
  console.log('Hello I am sending layer content');


  let table_container = _xyz.utils.createElement({
    tag: 'div',
    appendTo: el
  });

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  let xhr = new XMLHttpRequest();

  // Get bounds for request.
  const bounds = _xyz.map.getBounds();

  let columns = [];

  Object.values(layer.infoj).map(entry => {
      
    if(!entry.type || entry.type === 'numeric' || entry.type === 'integer' || entry.type === 'textarea'){
      entry.title = entry.label;
      columns.push(entry);
    }
      
    if(entry.type === 'date') {
      entry.title = entry.label;
      entry.formatter = _xyz.utils.formatDate;
      columns.push(entry);
    }

    if(entry.type === 'datetime') {
      entry.title = entry.label;
      entry.formatter = _xyz.utils.formatDateTime;
      columns.push(entry);
    }
  });

  //let table = new Tabulator(table_container, { columns: columns});

  //let table = new Tabulator(el, { columns: columns});

  xhr.open('POST', _xyz.host + '/api/tab/get?token=' + _xyz.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
    
  xhr.onload = e => {
    if (e.target.status !== 200) return;
    let data = JSON.parse(e.target.response);

    let table = new Tabulator(table_container, { columns: columns});
    table.setData(data);

    console.log('data set for '  + layer.key);

    //console.log(data);
    //console.log(e.target.response);
  };
    
  xhr.send(JSON.stringify({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    count: 50,
    //filter: JSON.stringify(layer.filter),
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  })); 

  //return table_container;
  //return el;
};


