export default _xyz => function () {

  const layer = this;

  !layer.display && layer.view && layer.view.dispatchEvent(new CustomEvent('toggleDisplay'));

  layer.display = true;

  layer.L && _xyz.map.removeLayer(layer.L);

  _xyz.map.addLayer(layer.L);

  if(layer.style && layer.style.label){

    _xyz.map.getLayers().forEach(l => {
      l === layer.label && _xyz.map.removeLayer(layer.label);
    });

    layer.style.label.display && _xyz.map.addLayer(layer.label);
  }

  _xyz.mapview.attribution.check();

  // Push the layer into the layers hook array.
  _xyz.hooks && _xyz.hooks.push('layers', layer.key);

  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();

  // Iterate through tables and charts to check whether table should be shown.
  if (layer.dataview && _xyz.dataview.node){

    Object.keys(layer.dataview).forEach(key => {

      if(layer.dataview[key].display) layer.dataview[key].show();

    });
  
  }

};