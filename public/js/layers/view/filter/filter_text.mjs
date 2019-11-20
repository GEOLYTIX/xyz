export default _xyz => (layer, filter_entry) => {

  // Reset deselected filter
  if(filter_entry.el && filter_entry.el.parentNode) return _xyz.layers.view.filter.reset(layer, filter_entry);
  
  const block = _xyz.layers.view.filter.block(layer, filter_entry);

  // identify element with filter field
  block.dataset.field = filter_entry.field;
  
  // Bind element with filter entry
  filter_entry.el = block;

  block.appendChild(_xyz.utils.wire()`
  <input type="text" placeholder="Search" onkeyup=${e=>{

    layer.filter.current[filter_entry.field] = {};
    layer.filter.current[filter_entry.field][filter_entry.filter] = e.target.value;

    layer.reload();

    layer.count(n => {

      layer.filter.run_output.disabled = !(n > 1);
  
      if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();
  
    })

  }}>`);
  
};