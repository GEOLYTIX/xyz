export default _xyz => table => {

  if (!table) return;

  if (table.key) {
    if (!table.layer.dataview[table.key]) return;
    Object.assign(table, table.layer.dataview[table.key]);
  }

  if (_xyz.dataview.node) {
    document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';
    _xyz.map.updateSize();
  }

  if (_xyz.dataview.tables.indexOf(table) < 0) _xyz.dataview.tables.push(table);

  if (_xyz.dataview.nav_bar) _xyz.dataview.addTab(table);

  table.columns.forEach(col => {

    col.title = col.title || col.field;

    if(col.type === 'date') col.formatter = _xyz.utils.formatDate;

    if(col.type === 'datetime') col.formatter = _xyz.utils.formatDateTime;

    if(table.visible && table.visible.length) col.visible = table.visible.includes(col.field) ?  true : false;

  });

  table.update = () => {

    const xhr = new XMLHttpRequest();

    const bounds = _xyz.mapview && _xyz.mapview.getBounds();

    // Create filter from legend and current filter.
    const filter = table.layer.filter && Object.assign({}, table.layer.filter.legend, table.layer.filter.current);
      
    xhr.open('GET', _xyz.host + '/api/layer/table?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      mapview_srid: _xyz.mapview.srid,
      layer: table.layer.key,
      table: table.key,
      viewport: table.viewport,
      orderby: table.orderby,
      order: table.order,
      filter: JSON.stringify(filter),
      south: bounds && bounds.south,
      west: bounds && bounds.west,
      north: bounds && bounds.north,
      east: bounds && bounds.east,
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
  

  let stopHammertime = false;

  table.activate = () => {

    if (_xyz.dataview && _xyz.dataview.btn && _xyz.dataview.btn.dataViewport) {

      if (table.viewport) {
        _xyz.dataview.btn.dataViewport.classList.add('active');

      } else {
        _xyz.dataview.btn.dataViewport.classList.remove('active');
      }

      _xyz.dataview.btn.dataViewport.style.display = 'block';
    }

    table.target = document.getElementById(table.target_id) || _xyz.dataview.tableContainer(table.toolbars);

    table.Tabulator = new _xyz.utils.Tabulator(
      table.target,
      {
        invalidOptionWarnings: false,
        placeholder: 'No Data Available',
        tooltipsHeader: true,
        columnVertAlign: 'center',
        columns: _xyz.dataview.groupColumns(table),//table.columns,
        layout: table.layout || 'fitDataFill',
        autoResize: true,
        height: _xyz.dataview.height || 'auto',
        groupBy: table.groupBy || null,
        initialSort: table.initialSort || null,
        groupStartOpen: typeof(table.groupStartOpen) === undefined ? true : table.groupStartOpen,
        groupToggleElement: typeof(table.groupToggleElement) === undefined ? 'arrow' : table.groupToggleElement,
        dataSorting: sorters => {

          if (!sorters[0]) return;
            
          if (table.orderby === sorters[0].field
              && table.order === sorters[0].dir) return;

          stopHammertime = false;

          table.orderby = sorters[0].field;

          table.order = sorters[0].dir;

          if (!stopHammertime) table.update();
          
        },
        dataSorted: (sorters, rows) => {
          stopHammertime = true;
        },
        rowClick: table.rowClick || rowClick,
        groupClick: table.groupClick || null
      });

    table.update();

    _xyz.dataview.current_table = table;

    function rowClick(e, row){
      const rowData = row.getData();

      if (!rowData.qid) return;

      _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: table.layer,
        table: table.from,
        id: rowData.qid,
      });
    }

  };

  // active only if displayed in the navbar 
  if(!table.tab || !table.tab.classList.contains('folded')) table.activate();

  return table;

};