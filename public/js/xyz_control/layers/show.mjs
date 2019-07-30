export default _xyz => function () {

  const layer = this;

  layer.display = true;
  layer.loaded = false;
  //layer.get();


  //console.log(layer.L.getVisible());

  _xyz.map.addLayer(layer.L);

  // if (layer.L && !layer.L.getVisible()) {
  //   _xyz.map.addLayer(layer.L);
  //   layer.L.setVisible(true);
  // }


  _xyz.mapview.attribution.check();

  if (layer.view.header) layer.view.header.toggleDisplay.textContent = 'layers';

  // Push the layer into the layers hook array.
  if (_xyz.hooks) _xyz.hooks.push('layers', layer.key);

  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();

  // Iterate through tables to check whether table should be shown.
  if (layer.tableview && _xyz.tableview.node) Object.keys(layer.tableview.tables).forEach(
    key => {
      const table = layer.tableview.tables[key];
      if (table.display) table.show();
    }
  );

};