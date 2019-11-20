export default _xyz => (layer, filter_entry) => {

  // Reset deselected filter
  if(filter_entry.el && filter_entry.el.parentNode) return _xyz.layers.view.filter.reset(layer, filter_entry);
  
  const block = _xyz.layers.view.filter.block(layer, filter_entry);

  // identify element with filter field
  block.dataset.field = filter_entry.field;
  
  // Bind element with filter entry
  filter_entry.el = block;

  filter_entry.filter.in.forEach(val => {

    block.appendChild(_xyz.utils.wire()`
    <label class="input-checkbox">
    <input
      type="checkbox"
      onchange=${e=>{

        // Create filter.
        if (!layer.filter.current[filter_entry.field]) layer.filter.current[filter_entry.field] = { in: [] };
                  
        if (e.target.checked) {

          // Add value to filter array.
          layer.filter.current[filter_entry.field].in.push(e.target.parentNode.innerText);
                  
        } else {

          // Get index of value in filter array.
          let idx = layer.filter.current[filter_entry.field]['in'].indexOf(e.target.parentNode.innerText);

          // Splice filter array on idx.
          layer.filter.current[filter_entry.field].in.splice(idx, 1);

        }

        layer.reload();

        layer.count(n => {

          layer.filter.run_output.disabled = !(n > 1);
      
          if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();
      
        })

      }}>
    </input>
    <div></div><span>${val}`);
  
  });
  
};