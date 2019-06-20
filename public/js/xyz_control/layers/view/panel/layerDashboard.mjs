export default (_xyz, layer) => {
  
  if(_xyz.mobile || !layer.dashboard || !layer.dashboard.charts) return;

  // Create cluster panel and add to layer dashboard.
  layer.dashboard.panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.view.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Dashboard'
    },
    appendTo: layer.dashboard.panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: layer.dashboard.panel,
          accordeon: true,
          scrolly: _xyz.desktop && _xyz.desktop.listviews
        });
      }
    }
  });

  // Return if tableview has no table definition.
  if(!layer.dashboard.charts) return;

  if(!_xyz.tableview.node) return;

  // Iterate through tables entries.
  Object.keys(layer.dashboard.charts).forEach(key => {

    const chart = layer.dashboard.charts[key];

    chart.key = key;
    chart.layer = layer;
    chart.title = chart.title || key;
    chart.target = _xyz.tableview.node.querySelector('.table');

    if(!chart.target) chart.target = _xyz.tableview.tableContainer();

    chart.show = () => { 
      console.log('add dashboard tab');
      //console.log(_xyz.tableview);
      _xyz.tableview.layerDashboard(chart); 
    }
    chart.remove = ()=> {
      console.log('remove dashboard tab');
      _xyz.tableview.removeTab(chart); 
    }

    // Create checkbox to toggle whether table is in tabs list.
    _xyz.utils.createCheckbox({
      label: chart.title,
      appendTo: layer.dashboard.panel,
      checked: !!chart.display,
      onChange: e => {

        chart.display = e.target.checked;

        if (!chart.display) return chart.remove();

        layer.show();
          
      }
    });

    if (chart.display && layer.display) chart.show();

  });

};