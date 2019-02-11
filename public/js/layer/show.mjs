export default (_xyz, layer) => {

  layer.show = _xyz.utils.compose(layer.show, ()=>{
    layer.loader.style.display = 'block';
    layer.toggle.textContent = 'layers';

    // Push the layer into the layers hook array.
    _xyz.hooks.push('layers', layer.key);

    // Check whether other group layers are visible.
    if (layer.group) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();
  });

};