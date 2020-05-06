export default _xyz => (layer, filter_entry) => {

  // Reset deselected filter
  if(filter_entry.el && filter_entry.el.parentNode) return _xyz.layers.view.filter.reset(layer, filter_entry);

  const block = _xyz.layers.view.filter.block(layer, filter_entry);

  // identify element with filter field
  block.dataset.field = filter_entry.field;

  // Bind element with filter entry
  filter_entry.el = block;

  // Create filter.
  if (!layer.filter.current[filter_entry.field]) {
    layer.filter.current[filter_entry.field] = {};
  }
	
  layer.filter.current[filter_entry.field]['boolean'] = true;

  block.appendChild(_xyz.utils.wire()`
  <label class="input-checkbox">
  <input type="checkbox"
    checked=true 
    onchange=${e=>{

      if (e.target.checked) {
        layer.filter.current[filter_entry.field]['boolean'] = true;
      } else {
        layer.filter.current[filter_entry.field]['boolean'] = false;
      }
  
      layer.reload();
  
      layer.count(n => {
  
        layer.filter.run_output.disabled = !(n > 1);
    
        if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();
    
      })
    }}>
  </input>
  <div></div><span>${filter_entry.name || 'True'}`);

  layer.reload();

  layer.count(n => {

    layer.filter.run_output.disabled = !(n > 1);

    if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();

  })

};