export default _xyz => function () {

  const layer = this;

  layer.display = false;

  if (layer.L) {
    _xyz.map.removeLayer(layer.L);
  };


  if (layer.style && layer.style.label && layer.label) {
    _xyz.map.removeLayer(layer.label);
  }


  if (layer.attribution) _xyz.mapview.attribution.remove(layer.attribution);
  
  _xyz.mapview.attribution.check();


  // Set layer display to false, hide the loader element and change the toggle icon.
  if (layer.view.loader) layer.view.loader.style.display = 'none';

  //if (layer.view.header) layer.view.header.toggleDisplay.textContent = 'layers_clear';
  if (layer.view.header) {
    layer.view.header.toggleDisplay.textContent = 'toggle_off';
    layer.view.header.toggleDisplay.classList.add('inactive');
  }
  
  // Filter the layer from the layers hook array.
  if (_xyz.hooks) _xyz.hooks.filter('layers', layer.key);   
  
  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();
  
  // Iterate through tables to check whether table should be removed.
  if (layer.dataview) Object.keys(layer.dataview.tables).forEach(
    key => {
  
      const table = layer.dataview.tables[key];
      
      if (table.tab) table.remove();

      if(_xyz.dataview.nav_dropdown && !_xyz.dataview.nav_dropdown.firstChild) _xyz.map.updateSize();
      
    });

  if (layer.dataview && layer.dataview.charts) Object.keys(layer.dataview.charts).forEach(
    key => {
  
      const chart = layer.dataview.charts[key];
      
      if (chart.tab) chart.remove();

      if(_xyz.dataview.nav_dropdown && !_xyz.dataview.nav_dropdown.firstChild) _xyz.map.updateSize();
      
    });

};