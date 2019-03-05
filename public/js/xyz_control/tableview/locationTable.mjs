export default _xyz => table => {

  if (!table || !table.target || !table.location) return;

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'block';
    _xyz.mapview.node.style.height = 'calc(100% - 40px)';
  }


  if (!table.columns) {

    const infoj = _xyz.workspace.locale.layers[table.location.layer].infoj;

    const infoj_table = Object.values(infoj).find(v => v.title === table.title);

    Object.assign(table, infoj_table);

  }

  const columns = [{ 'field': 'rows', 'title': table.title }];

  table.columns.forEach(col => {
    if (!col.aspatial) columns.push({ 'field': col.field, 'title': col.title || col.field });
  });

  Object.keys(table.agg || {}).forEach(key => {
    columns.push({ 'field': key, 'title': table.agg[key].title || key });
  });

  if (_xyz.tableview.tables.indexOf(table) < 0) _xyz.tableview.tables.push(table);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(table);

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

      table.Tabulator.setData(e.target.response);

      table.Tabulator.redraw(true);

      if (table.chart) {

        let trs = table.location.view.node.children;

        let prev_tr = Array.from(trs).filter(tr => tr.getAttribute('data-name') === table.title);

        if (table.checked && table.chart.tr) {
          return;
        }

        if (!table.chart.tr) {

          let fields = [];

          e.target.response.map(field => fields.push({ 'label': field.rows, 'field': table.chart.field, 'value': field[table.chart.field], 'displayValue': field[table.chart.field] }));

          table.chart.tr = _xyz.utils.createElement({ tag: 'tr' });
          //table.chart.tr.setAttribute('data-name', table.title);

          let td = _xyz.utils.createElement({ tag: 'td', options: { colSpan: '2' }, appendTo: table.chart.tr }),
            section = _xyz.utils.createElement({ tag: 'div', options: { classList: 'table-section' }, appendTo: td }),
            header = _xyz.utils.createElement({ tag: 'div', options: { classList: 'btn_subtext cursor noselect' }, style: { textAlign: 'left', fontStyle: 'italic' }, appendTo: section });

          _xyz.utils.createElement({ tag: 'span', options: { textContent: table.title }, appendTo: header });

          section.appendChild(_xyz.utils.chart({
            label: table.title,
            fields: fields,
            chart: table.chart
          }));

          table.location.view.node.appendChild(table.chart.tr);
        }
      }
    };

    xhr.send();
  };

  table.activate = () => {

    table.Tabulator = new _xyz.utils.Tabulator(
      table.target, {
        columns: columns,
        autoResize: true,
        height: _xyz.tableview.height || '100%'
      });

    table.update();

    _xyz.tableview.current_table = table;

  };

  table.activate();

};