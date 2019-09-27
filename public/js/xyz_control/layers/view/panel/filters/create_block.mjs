export default (_xyz, layer, filter_entry) => {

  const block = _xyz.utils.wire()`
  <div class="block">
  <div class="title">${filter_entry.label}</div>
  <i class="material-icons cancel-btn" onclick=${e=>remove(e)}>clear`;

  layer.filter.list.appendChild(block);

  function remove(e) {

    e.target.parentNode.remove();

    delete layer.filter.current[filter_entry.field];
    
    // Hide clear all filter.
    if (Object.keys(layer.filter.current).length < 1) {
      layer.filter.clear_all.style.display = 'none';
      layer.count(n => {
        layer.filter.run_output.disabled = !(n > 1);     
      })
    }
    
    // Enable filter in select dropdown.
    Object.values(layer.filter.select.options).forEach(opt => {
      if (opt.value === filter_entry.field) opt.disabled = false;
    });
    
    layer.show();
  }

  return block;

};