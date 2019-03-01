export default (_xyz, layer) => {

  layer.remove = _xyz.utils.compose(layer.remove, ()=>{

    // Set layer display to false, hide the loader element and change the toggle icon.
    layer.loader.style.display = 'none';
    layer.toggle.textContent = 'layers_clear';

    // Filter the layer from the layers hook array.
    _xyz.hooks.filter('layers', layer.key);   

    // Check whether other group layers are visible.
    if (layer.group) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();

    // Iterate through tables to check whether table should be removed.
    if (layer.tableview) Object.keys(layer.tableview.tables).forEach(
      key => {

        const table = layer.tableview.tables[key];
    
        table.remove();
    
      });

  });

};