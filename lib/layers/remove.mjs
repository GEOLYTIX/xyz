export default _xyz => function () {

  const layer = this;

  layer.display && layer.view && layer.view.dispatchEvent(new CustomEvent('toggleDisplay'));

  layer.display = false;

  layer.L && _xyz.map.removeLayer(layer.L);

  if (layer.style && layer.style.label && layer.label) {
    _xyz.map.removeLayer(layer.label);
  }

  layer.attribution && _xyz.mapview.attribution.remove(layer.attribution);
  
  _xyz.mapview.attribution.check();
  
  // Filter the layer from the layers hook array.
  if (_xyz.hooks) _xyz.hooks.filter('layers', layer.key);   
  
  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();
  
  // Iterate through tables to check whether table should be removed.
  if (layer.dataviews && _xyz.dataviews.tabview.node){

    Object.entries(layer.dataviews).forEach(dataview => {

      dataview[1].tab && dataview[1].remove();

    });
  }

};