import _xyz from '../../_xyz.mjs';

export default layer => {

  layer.tableview.download = true;

  let csv_download = _xyz.utils.createElement({
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
    }
  });
    
  let json_download = _xyz.utils.createElement({
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
    }
  });

  layer.tableview.section.insertBefore(json_download, layer.tableview.section.firstChild);
  layer.tableview.section.insertBefore(csv_download, layer.tableview.section.firstChild);
};