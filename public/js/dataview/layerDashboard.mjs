export default _xyz => chart => {

  if (!chart) return;

  if (_xyz.dataview.node)  document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';

  if (_xyz.dataview.tables.indexOf(chart) < 0) _xyz.dataview.tables.push(chart);

  if (_xyz.dataview.nav_bar) _xyz.dataview.addTab(chart);

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

      _xyz.dataview.node.querySelector('.tab-content').innerHTML = '';

      let chartElem = _xyz.dataview.charts.create({
        label: chart.key, 
        columns: chart.columns,
        fields: e.target.response, 
        chart: chart.chart
      });

      _xyz.dataview.node.querySelector('.tab-content').appendChild(chartElem);

    };

    xhr.send();

  };


  chart.activate = () => {

    if (_xyz.dataview && _xyz.dataview.btn && _xyz.dataview.btn.dataViewport) {

      if (chart.viewport) {
        _xyz.dataview.btn.dataViewport.classList.add('active');

      } else {
        _xyz.dataview.btn.dataViewport.classList.remove('active');
      }

      _xyz.dataview.btn.dataViewport.style.display = 'block';
    }

    chart.update();

    _xyz.dataview.current_table = chart;

  };

  // active only if displayed in the navbar 
  if(!chart.tab || !chart.tab.classList.contains('folded')) chart.activate();

};