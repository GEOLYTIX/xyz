export default _xyz => (layer, filter_entry) => {

  // Reset deselected filter
  if(filter_entry.el && filter_entry.el.parentNode) return _xyz.layers.view.filter.reset(layer, filter_entry);

  const block = _xyz.layers.view.filter.block(layer, filter_entry);

  // identify element with filter field
  block.dataset.field = filter_entry.field;

  // Bind element with filter entry
  filter_entry.el = block;

  // Label for min / greater then control.
  var range = _xyz.utils.html.node`
  <div class="input-flex">
    <span>${_xyz.language.layer_filter_date_after}`
  
  const input_min = _xyz.utils.html.node`
  <input type="text" readonly placeholder=${_xyz.language.layer_filter_pick} style="width: 60%;">`

  range.appendChild(input_min);

  block.appendChild(range);

  var range = _xyz.utils.html.node`
  <div class="input-flex">
    <span>Before`

  const input_max = _xyz.utils.html.node`
  <input type="text" readonly placeholder=${_xyz.language.layer_filter_pick} style="width: 60%;">`

  range.appendChild(input_max);

  block.appendChild(range);

  _xyz.utils.flatpickr({
    locale: (_xyz.hooks && _xyz.hooks.current.language) || null,
    element: input_min,
    // enableTime: filter_entry.type === 'datetime' ? true : false,
    callback: dateStr => {
      
      input_min.value = dateStr;
      applyFilter();
    
    }});

    _xyz.utils.flatpickr({
    locale: (_xyz.hooks && _xyz.hooks.current.language) || null,
    element: input_max,
    // enableTime: filter_entry.type === 'datetime' ? true : false,
    callback: dateStr => {
      
      input_max.value = dateStr;
      applyFilter();

    }});

  let timeout;

  function applyFilter() {

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // Create filter.
      layer.filter.current[filter_entry.field] = {};
      layer.filter.current[filter_entry.field].gt = _xyz.utils.meltDateStr(input_min.value) || 0;                                                                                 
      layer.filter.current[filter_entry.field].lt = _xyz.utils.meltDateStr(input_max.value) || 9999999999;

      layer.reload();
      
      layer.show();

      layer.count(n => {

        if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();

      })

    }, 500);
  }
};