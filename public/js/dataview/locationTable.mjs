export default _xyz => (table, callback) => {

  if (!table || !table.location) return;

  if (_xyz.dataview.node)  document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';
  
  if (!table.columns) {

    const infoj = table.location.layer.infoj;
    const infoj_table = Object.values(infoj).find(v => v.title === table.title);

    Object.assign(table, infoj_table);

  }

  table.columns.unshift({ field: 'rows', title: table.title, headerSort: false, align: 'left'});

  Object.keys(table.agg || {}).forEach(key => {
    table.columns.push(Object.assign({}, {field: key}, table.agg[key]));
  });

  if (_xyz.dataview.tables.indexOf(table) < 0) _xyz.dataview.tables.push(table);

  if (_xyz.dataview.nav_bar) _xyz.dataview.addTab(table);

  table.update = () => {

    const xhr = new XMLHttpRequest();

    if(table.pgFunction){

      xhr.open('GET', _xyz.host + '/api/location/pgfunction?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: table.location.layer.key,
        id: table.location.id,
        pgFunction: table.pgFunction,
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

    } else {

      xhr.open('GET', _xyz.host + '/api/location/table?' + _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: table.location.layer.key,
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
      
    }
    xhr.send();
  };

  table.activate = () => {

    table.target = document.getElementById(table.target_id) || _xyz.dataview.tableContainer(table.toolbars);
    
    // disable header sorting by default
    table.columns.map(col => { col.headerSort = col.headerSort ? col.headerSort : false;});

    // group columns if grouped defined
    let columns = _xyz.dataview.groupColumns(table);
    // filtered out helper columns
    columns = columns.filter(col => { return !col.aspatial; });

    table.Tabulator = new _xyz.utils.Tabulator(
      table.target,
      {
        invalidOptionWarnings: false,
        placeholder: 'No Data Available',
        tooltipsHeader: true,
        columnVertAlign: 'center',
        columns: columns,
        layout: table.layout || 'fitDataFill',
        height: 'auto'
      });

    table.update();

    _xyz.dataview.current_table = table;

  };
  
  // active only if displayed in the navbar 
  if(!table.tab || !table.tab.classList.contains('folded')) table.activate();

};