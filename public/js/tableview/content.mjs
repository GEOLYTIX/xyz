import _xyz from '../_xyz.mjs';
import setData from './setData.mjs';
import Refresh from './refresh.mjs';

export default layer => {

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_inline',
      textContent: 'Download CSV'
    },
    eventListener: {
      event: 'click',
      funct: () => {
        layer.tableview.table.download('csv', layer.name + '.csv');
      }
    },
    appendTo: layer.tableview.section
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
        layer.tableview.table.download('json', layer.name + '.json');
      }
    },
    appendTo: layer.tableview.section
  });

  Refresh(layer);

  _xyz.utils.createElement({
    tag: 'div',
    style: {
      fontSize: '12px',
      padding: '2px',
      marginTop: '5px'
    },
    appendTo: layer.tableview.section
  });

  layer.tableview.container = _xyz.utils.createElement({
    tag: 'div',
    appendTo: layer.tableview.section
  });

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  setData(layer);

  return layer.tableview.section;
};


