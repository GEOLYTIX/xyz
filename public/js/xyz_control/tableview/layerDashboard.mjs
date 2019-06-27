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

    _xyz.tableview.node.querySelector('.tab-content').innerHTML = '';
    _xyz.tableview.node.querySelector('.tab-content').textContent = chart.key;
    console.log('update charts');

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