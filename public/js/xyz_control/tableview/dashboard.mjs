export default _xyz => (table, callback) => {

  if (!table || !table.location) return;

  if (_xyz.tableview.node) {
    // _xyz.tableview.node.style.display = 'block';
    //_xyz.mapview.node.style.height = 'calc(100% - 40px)';
    document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';

  }

  /*if (!table.columns) {

    const infoj = _xyz.workspace.locale.layers[table.location.layer].infoj;

    const infoj_table = Object.values(infoj).find(v => v.title === table.title);

    Object.assign(table, infoj_table);

  }

  const columns = [];

  table.columns.forEach(col => {
    columns.push({ field: col.field, title: col.title || col.field, headerSort: false });
  });*/

  if (_xyz.tableview.tables.indexOf(table) < 0) _xyz.tableview.tables.push(table);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(table);

  table.update = () => {

    console.log('update dashboard');
  	/*const xhr = new XMLHttpRequest();

  	xhr.open('GET', _xyz.host + '/api/location/list?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: table.location.layer,
      table: _xyz.workspace.locale.layers[table.location.layer].tables ? _xyz.workspace.locale.layers[table.location.layer].tableMax() : null,
      id: table.location.id,
      tableDef: table.title,
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {
      if (e.target.status !== 200) return;

      table.Tabulator.setData(e.target.response);
      table.Tabulator.redraw(true);
      if (callback) callback(e.target.response);
    };

    xhr.send();*/
    table.target.textContent = 'Hi I am a dashboard';

  };

  table.activate = () => {

    console.log('activate dashboard');

    //table.target.textContent = 'Hi I am a dashboard';

    /*table.Tabulator = new _xyz.utils.Tabulator(
      table.target, {
        columns: columns,
        // autoResize: true,
        layout: 'fitDataFill',
        height: 'auto'
      });*/

    table.update();

    _xyz.tableview.current_table = table;

  };

  // active only if displayed in the navbar 
  if(!table.tab || !table.tab.classList.contains('folded')) table.activate();

};