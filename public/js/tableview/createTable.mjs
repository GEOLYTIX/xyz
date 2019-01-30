import Tabulator from 'tabulator-tables';

export default _xyz => {

  _xyz.tableview.createTable = params => {

    if (!params.target) return;
    
    _xyz.tableview.table = params.target;

    _xyz.tableview.table.innerHTML = '';

    if (!params.layer) return;

    if (params.layer) _xyz.tableview.current_layer = params.layer;

    const columns = Object.values(_xyz.tableview.current_layer.infoj).filter(entry => {

      entry.title = entry.label;

      if(entry.type === 'date') entry.formatter = _xyz.utils.formatDate;

      if(entry.type === 'datetime') entry.formatter = _xyz.utils.formatDateTime;

      return entry.type === 'numeric'
        || entry.type === 'integer'
        || entry.type === 'text'
        || entry.type === 'textarea'
        || entry.type === 'date'
        || entry.type === 'datetime';

    });

    _xyz.tableview.current_layer.table_view.table = new Tabulator(_xyz.tableview.table, {
      columns: columns,
      autoResize: true,
      //selectable: true,
      //resizableRows: true,
      height: _xyz.tableview.height || '100%'
      // rowClick: (e, row) => {

      //   console.log(row);

      // }
    }); 

    _xyz.tableview.updateTable();    

  };
};