export default _xyz => params => {

  console.log(params);

  if (!params.target) return;

  if (_xyz.tableview.node) _xyz.tableview.node.style.display = 'block';
   
  _xyz.tableview.table = params.target;

  if (!params.layer) return;

  _xyz.tableview.current_layer = params.layer;

  if (!params.table) return;

  params.table.columns.forEach(col => {

    col.title = col.title || col.field;

    if(col.type === 'date') col.formatter = _xyz.utils.formatDate;

    if(col.type === 'datetime') col.formatter = _xyz.utils.formatDateTime;

  });

  params.table.update = () => {

    const xhr = new XMLHttpRequest();

    const bounds = _xyz.map && _xyz.map.getBounds();
        
    xhr.open('GET', _xyz.host + '/api/layer/table?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: params.layer.key,
      table: params.layer.tableMax(),
      viewport: bounds ? true : false,
      west: bounds && bounds.getWest(),
      south: bounds && bounds.getSouth(),
      east: bounds && bounds.getEast(),
      north: bounds && bounds.getNorth(),
      token: _xyz.token
    }));
  
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    
    xhr.onload = e => {
    
      if (e.target.status !== 200) return;
      
      params.table.Tabulator.setData(e.target.response);
  
      params.table.Tabulator.redraw(true);
  
    };
  
    xhr.send();

  };
   
  params.table.activate = () => {

    params.table.Tabulator =
    new _xyz.utils.Tabulator(_xyz.tableview.table, {
      columns: params.table.columns,
      //columns: _xyz.tableview.current_layer.tableview.columns,
      autoResize: true,
      //selectable: true,
      //resizableRows: true,
      height: _xyz.tableview.height || '100%'
      //rowClick: (e, row) => console.log(row)
    });

    params.table.update();

    _xyz.tableview.current_table = params.table;

  };

  params.table.activate();

  _xyz.tableview.tables.push(params.table);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(params);

};