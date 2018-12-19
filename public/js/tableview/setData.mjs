import _xyz from '../_xyz.mjs';
import Tabulator from 'tabulator-tables';
import Refresh from './refresh.mjs';

export default layer => {

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

    layer.tableview.container.innerHTML = '';
        
    if(data.length){

      layer.tableview.table = new Tabulator(layer.tableview.container, {
        height: tableHeight,
        columns: columns,
        dataLoaded: function(){ 
          //freeze first row on data load
          /*let firstRow = this.getRows()[0];
                    if(firstRow) firstRow.freeze();*/
        }
      });

      layer.tableview.table.setData(data);
      layer.tableview.container.previousSibling.textContent = 'Showing ' + data.length + ' results.';
    } else {
        
      layer.tableview.section.innerHTML = '';
        
      Refresh(layer);

      _xyz.utils.createElement({
        tag: 'div',
        options: {
          textContent: 'No results.'
        },
        style: {
          fontSize: '12px',
          padding: '2px',
          marginTop: '5px'
        },
        appendTo: layer.tableview.section
      });
    }

  };

  xhr.send(JSON.stringify({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    offset: (layer.tableview.offset ? layer.tableview.offset : 0), // this will be click counter from load more button
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  })); 
};