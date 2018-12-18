import _xyz from '../_xyz.mjs';
import Tabulator from 'tabulator-tables';

export default (layer, el, ev) => {

  let xhr = new XMLHttpRequest(), columns = [];

  const bounds = _xyz.map.getBounds(); // Get bounds for request.
    
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
    
  xhr.open('POST', _xyz.host + '/api/tab/get?token=' + _xyz.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
    
  xhr.onload = e => {
    if (e.target.status !== 200) return;
        
    let data = JSON.parse(e.target.response);

    let tableHeight = (window.innerHeight - 150) + 'px';

    if(ev && ev.target.classList) ev.target.classList.remove('disabled');

    el.innerHTML = '';
        

    layer.tableview = new Tabulator(el, {
      height: tableHeight,
      columns: columns,
      dataLoaded: function(){ 
        //freeze first row on data load
        /*let firstRow = this.getRows()[0];
              if(firstRow) firstRow.freeze();*/
      }
    });

    layer.tableview.setData(data);

    el.nextSibling.textContent = data.length ? 'Showing first ' + data.length + ' results.' : 'No results.';
  };

  xhr.send(JSON.stringify({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    count: 99,
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  })); 
};