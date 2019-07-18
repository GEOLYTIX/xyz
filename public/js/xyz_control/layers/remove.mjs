export default _xyz => function () {

  const layer = this;

  layer.display = false;

  layer.loaded = false;

  if (layer.L) {
    _xyz.map.removeLayer(layer.L);
    layer.L = null;
  };

  if (layer.label) {
    _xyz.map.removeLayer(layer.label);
    layer.label = null;
  };

  if (layer.attribution) _xyz.mapview.attribution.remove(layer.attribution);
  
  _xyz.mapview.attribution.check();

  if(layer.hover && layer.hover.field) layer.hover.clear(); 
  

  // Set layer display to false, hide the loader element and change the toggle icon.
  if (layer.view.loader) layer.view.loader.style.display = 'none';

  if (layer.view.header) layer.view.header.toggleDisplay.textContent = 'layers_clear';
  
  // Filter the layer from the layers hook array.
  if (_xyz.hooks) _xyz.hooks.filter('layers', layer.key);   
  
  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();
  
  // Iterate through tables to check whether table should be removed.
  if (layer.tableview) Object.keys(layer.tableview.tables).forEach(
    key => {
  
      const table = layer.tableview.tables[key];
      
      if (table.tab) table.remove();
      
    });

};