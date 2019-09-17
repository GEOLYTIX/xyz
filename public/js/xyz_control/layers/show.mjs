export default _xyz => function () {

  const layer = this;

  layer.display = true;

  _xyz.map.getLayers().forEach(l => {
    if(l === layer.L) _xyz.map.removeLayer(layer.L);
  });

  _xyz.map.addLayer(layer.L);

  if(layer.style && layer.style.label){

    if(layer.style.label.display) {
      
      _xyz.map.addLayer(layer.label);
    
    } else {

      _xyz.map.getLayers().forEach(l => {
        if(l === layer.label) _xyz.map.removeLayer(layer.label);
      });
   }
    
  }

  _xyz.mapview.attribution.check();

  if (layer.view.header) layer.view.header.toggleDisplay.textContent = 'layers';

  // Push the layer into the layers hook array.
  if (_xyz.hooks) _xyz.hooks.push('layers', layer.key);

  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();

  // Iterate through tables and charts to check whether table should be shown.
  if (layer.tableview && _xyz.tableview.node){

    Object.keys(layer.tableview.tables).forEach(key => {
      const table = layer.tableview.tables[key];
      if (table.display) table.show();
    });

    if(layer.tableview.charts) Object.keys(layer.tableview.charts).forEach(key => {
      const chart = layer.tableview.charts[key];
      if (chart.display) chart.show();
    });
  
  }

};