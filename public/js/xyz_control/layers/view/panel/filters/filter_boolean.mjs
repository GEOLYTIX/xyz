export default (_xyz, layer, filter_entry) => {

  const block = layer.filter.block(filter_entry);

  // Create filter.
  if (!layer.filter.current[filter_entry.field]) {
    layer.filter.current[filter_entry.field] = {};
  }
	
  layer.filter.current[filter_entry.field]['boolean'] = true;

  block.appendChild(_xyz.utils.wire()`
  <label class="checkbox">${filter_entry.name || 'True'}
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
  <div class="checkbox_i">`);

  layer.reload();

  layer.count(n => {

    layer.filter.run_output.disabled = !(n > 1);

    if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();

  })

};