export default _xyz => chart => {

  if (!chart) return;

  //if (chart.key) {
    //if (!chart.layer.tableview.tables[chart.title]) return;
    //if (chart.layer.tableview.tables[chart.key]){
    //Object.assign(chart, chart.layer.tableview.tables[chart.key]); 
    //}
  //}

  if (_xyz.tableview.node) {
    // _xyz.tableview.node.style.display = 'block';
    // //_xyz.mapview.node.style.height = 'calc(100% - 40px)';
    document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';
  }

  if (_xyz.tableview.tables.indexOf(chart) < 0) _xyz.tableview.tables.push(chart);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(chart);

  chart.update = () => {

    const xhr = new XMLHttpRequest();

    const bounds = _xyz.mapview && _xyz.mapview.getBounds();

    // Create filter from legend and current filter.
    const filter = chart.layer.filter && Object.assign({}, chart.layer.filter.legend, chart.layer.filter.current);

    xhr.open('GET', _xyz.host + '/api/layer/chart?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: chart.layer.key,
      chart: chart.key,
      viewport: chart.viewport,
      orderby: chart.orderby,
      order: chart.order,
      filter: JSON.stringify(filter),
      mapview_srid: _xyz.mapview.srid,
      west: bounds && bounds.west,
      south: bounds && bounds.south,
      east: bounds && bounds.east,
      north: bounds && bounds.north,
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      _xyz.tableview.node.querySelector('.tab-content').innerHTML = '';

      let chartElem = _xyz.charts.create({
        label: chart.key, 
        columns: chart.columns,
        fields: e.target.response, 
        chart: chart.chart
      });

      _xyz.tableview.node.querySelector('.tab-content').appendChild(chartElem);

    };

    xhr.send();

  };


  chart.activate = () => {

    if (_xyz.tableview && _xyz.tableview.btn && _xyz.tableview.btn.tableViewport) {

      if (chart.viewport) {
        _xyz.tableview.btn.tableViewport.classList.add('active');

      } else {
        _xyz.tableview.btn.tableViewport.classList.remove('active');
      }

      _xyz.tableview.btn.tableViewport.style.display = 'block';
    }

    chart.update();

    _xyz.tableview.current_table = chart;

  };

  // active only if displayed in the navbar 
  if(!chart.tab || !chart.tab.classList.contains('folded')) chart.activate();

};