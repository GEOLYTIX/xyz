import _xyz from '../_xyz.mjs';
import setData from './setData.mjs';

export default layer => {
    
  let btn_refresh = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_inline',
      title: 'Refresh'
    },
    eventListener: {
      event: 'click',
      funct: (e) => {
        console.log('Refresh data for ' + layer.name);
        layer.tableview.offset = 0; // set offset back to zero
        e.stopPropagation();
        setData(layer);
      }
    },
    appendTo: layer.tableview.section
  });

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      classList: 'material-icons',
      textContent: 'autorenew'
    },
    style: {
      fontSize: '14px'
    },
    appendTo: btn_refresh
  });
    
  _xyz.utils.createElement({
    tag: 'em',
    options: {
      textContent: 'Refresh'
    },
    appendTo: btn_refresh
  });
    
  _xyz.utils.createElement({
    tag: 'span',
    appendTo: btn_refresh
  });
};