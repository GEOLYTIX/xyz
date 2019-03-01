export default _xyz => table => {

  if (!table || !table.target || !table.layer || !table.key) return;

  if (!table.layer.tableview.tables[table.key]) return;

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'block';
    _xyz.mapview.node.style.height = 'calc(100% - 40px)';
  }

  Object.assign(table, table.layer.tableview.tables[table.key]);

  if (_xyz.tableview.tables.indexOf(table) < 0) _xyz.tableview.tables.push(table);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(table);

  table.columns.forEach(col => {

    col.title = col.title || col.field;

    if(col.type === 'date') col.formatter = _xyz.utils.formatDate;

    if(col.type === 'datetime') col.formatter = _xyz.utils.formatDateTime;

  });

  table.update = () => {

    const xhr = new XMLHttpRequest();

    const bounds = _xyz.map && _xyz.map.getBounds();

    // Create filter from legend and current filter.
    const filter = table.layer.filter && Object.assign({}, table.layer.filter.legend, table.layer.filter.current);
      
    xhr.open('GET', _xyz.host + '/api/layer/table?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: table.layer.key,
      table: table.key,
      viewport: !!bounds,
      filter: JSON.stringify(filter),
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
      
      table.Tabulator.setData(e.target.response);
  
      table.Tabulator.redraw(true);
  
    };
  
    xhr.send();

  };
   
  table.activate = () => {

    table.Tabulator = new _xyz.utils.Tabulator(
      table.target,
      {
        columns: table.columns,
        autoResize: true,
        height: _xyz.tableview.height || '100%'
      });

    table.update();

    _xyz.tableview.current_table = table;

  };

  table.activate();

};