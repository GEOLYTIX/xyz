import _xyz from '../_xyz.mjs';
import setData from './setData.mjs';
//import Tabulator from 'tabulator-tables';

export default layer => {
  console.log('Hello I am sending layer content');

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_inline',
      textContent: 'Download CSV'
    },
    eventListener: {
      event: 'click',
      funct: () => {
        layer.tableview.download('csv', layer.name + '.csv');
      }
    },
    appendTo: layer.tab_section
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_inline',
      textContent: 'Download JSON'
    },
    eventListener: {
      event: 'click',
      funct: () => {
        layer.tableview.download('json', layer.name + '.json');
      }
    },
    appendTo: layer.tab_section
  });

  let btn_refresh = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_inline',
      //title: 'Refresh'
      textContent: 'Refresh'
    },
    eventListener: {
      event: 'click',
      funct: (e) => {
        console.log('Refresh data for ' + layer.name);
        e.target.classList.add('disabled');
        setData(layer, table_container, e);
      }
    },
    appendTo: layer.tab_section
  });

  /*_xyz.utils.createElement({
    tag: 'i',
    options: {
      classList: 'material-icons noselect',
      textContent: 'autorenew'
    },
    style: {
      fontSize: '14px'
    },
    appendTo: btn_refresh
  });

  _xyz.utils.createElement({
    tag: 'span',
    options: {
      className: 'noselect',
      textContent: 'Refresh'
    },
    appendTo: btn_refresh
  });*/


  let table_container = _xyz.utils.createElement({
    tag: 'div',
    appendTo: layer.tab_section
  });

  _xyz.utils.createElement({
    tag: 'div',
    style: {
      fontSize: '12px',
      padding: '2px',
      marginTop: '5px'
    },
    appendTo: layer.tab_section
  });

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  //let columns = [];

  /*Object.values(layer.infoj).map(entry => {
      
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
  });*/

  setData(layer, table_container);
  /*let xhr = new XMLHttpRequest();

  // Get bounds for request.
  const bounds = _xyz.map.getBounds();

  xhr.open('POST', _xyz.host + '/api/tab/get?token=' + _xyz.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
    
  xhr.onload = e => {
    if (e.target.status !== 200) return;
    let data = JSON.parse(e.target.response);

    let tableHeight = (window.innerHeight - 150) + 'px';

    let table = new Tabulator(table_container, {
      height: tableHeight,
      columns: columns,
      dataLoaded: function(){ 
        //freeze first row on data load
        //let firstRow = this.getRows()[0];
        //if(firstRow) firstRow.freeze();
      }
    });
    
    table.setData(data);

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: data.length ? 'Showing first ' + data.length + ' results.' : 'No results.'
      },
      style: {
        fontSize: '12px',
        padding: '2px',
        marginTop: '5px'
      },
      eventListener: {
        event: 'click',
        funct: () => {
          table.download('json', layer.name + '.json');
        }
      },
      appendTo: layer.tab_section
    });
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
  })); */

  return layer.tab_section;
};


