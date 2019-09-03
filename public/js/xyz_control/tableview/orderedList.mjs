export default _xyz => (table, callback) => {

  if (!table || !table.location) return;

  if (_xyz.tableview.node) {
    // _xyz.tableview.node.style.display = 'block';
    //_xyz.mapview.node.style.height = 'calc(100% - 40px)';
    document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';

  }

  if (!table.columns) {

    const infoj = _xyz.workspace.locale.layers[table.location.layer].infoj;

    const infoj_table = Object.values(infoj).find(v => v.title === table.title);

    Object.assign(table, infoj_table);

  }

  //const columns = [];

  /*table.columns.forEach(col => {
    columns.push({ field: col.field, title: col.title || col.field, headerSort: false });
  });*/

  if (_xyz.tableview.tables.indexOf(table) < 0) _xyz.tableview.tables.push(table);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(table);

  table.update = () => {

  	const xhr = new XMLHttpRequest();

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

    xhr.send();

  };

  table.activate = () => {

    table.target = document.getElementById(table.target_id) || _xyz.tableview.tableContainer(table.toolbars);

    // disable header sorting by default
    table.columns.map(col => col.headerSort = col.headerSort ? col.headerSort : false );

    table.Tabulator = new _xyz.utils.Tabulator(
      table.target, {
        placeholder: "No Data Available",
        tooltipsHeader: true,
        columnVertAlign: "center",
        columns: _xyz.tableview.groupColumns(table),
        //autoResize: false,
        layout: table.layout || 'fitDataFill',
        height: 'auto'
      });

    table.update();

    _xyz.tableview.current_table = table;

  };

  // active only if displayed in the navbar 
  if(!table.tab || !table.tab.classList.contains('folded')) table.activate();

};