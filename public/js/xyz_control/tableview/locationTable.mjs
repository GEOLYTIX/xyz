export default _xyz => params => {

  if (!params.target) return;

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'block';
    _xyz.mapview.node.style.height = 'calc(100% - 40px)';
  }
   
  _xyz.tableview.table = params.target;

  if (!params.table) return;

  params.table.columns.forEach(col => {

    col.title = col.title || col.field;

  });

  params.table.update = () => {

    const xhr = new XMLHttpRequest();
       
    xhr.open('GET', _xyz.host + '/api/location/table?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: params.layer,
      table: params.table.field,
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
      autoResize: true,
      height: _xyz.tableview.height || '100%'
    });

    params.table.update();

    _xyz.tableview.current_table = params.table;

  };

  params.table.activate();

  if (_xyz.tableview.tables) _xyz.tableview.tables.push(params.table);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(params);

};