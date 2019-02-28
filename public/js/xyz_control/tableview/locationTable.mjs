export default _xyz => params => {

  if (!params.target) return;

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'block';
    _xyz.mapview.node.style.height = 'calc(100% - 40px)';
  }

  if (!params.table) return;

  const table = params.table;


  if (!table.location) return;



  const columns = [{ 'field': 'rows', 'title': table.title }];

  table.columns.forEach(col => {
    if (!col.aspatial) columns.push({ 'field': col.field, 'title': col.title || col.field });
  });

  Object.keys(table.agg || {}).forEach(key => {
    columns.push({ 'field': key, 'title': table.agg[key].title || key });
  });


  table.update = () => {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/table?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: table.location.layer,
      id: table.location.id,
      tableDef: table.title,
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      console.log(e.target.response);

      //table.Tabulator.setData(formatRows(e.target.response));
      table.Tabulator.setData(e.target.response);

      table.Tabulator.redraw(true);

    };

    xhr.send();

  };

  table.activate = () => {

    table.Tabulator = new _xyz.utils.Tabulator(
      params.target,
      {
        columns: columns,
        autoResize: true,
        height: _xyz.tableview.height || '100%'
      });

    table.update();

    _xyz.tableview.current_table = table;

  };

  table.activate();


  if (!table.checked) {

    if (_xyz.tableview.tables) _xyz.tableview.tables.push(table);

    if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(params);

  }

};