export default _xyz => params => {

  console.log(params);

  if (!params.target) return;

  if (_xyz.tableview.node) _xyz.tableview.node.style.display = 'block';
   
  _xyz.tableview.table = params.target;

  if (!params.layer) return;

  if (params.layer) _xyz.tableview.current_layer = params.layer;

  _xyz.tableview.current_layer.tableview.columns = Object.values(_xyz.tableview.current_layer.infoj).filter(entry => {

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

  _xyz.tableview.current_layer.tableview.Tab = () => {
    _xyz.tableview.current_layer.tableview.table = new _xyz.utils.Tabulator(_xyz.tableview.table, {
      columns: _xyz.tableview.current_layer.tableview.columns,
      autoResize: true,
      //selectable: true,
      //resizableRows: true,
      height: _xyz.tableview.height || '100%'
      //rowClick: (e, row) => console.log(row)
    });

    _xyz.tableview.updateTable(); 
  };

  _xyz.tableview.current_layer.tableview.Tab();

  params.Tab = _xyz.tableview.current_layer.tableview.Tab;

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(params);

};