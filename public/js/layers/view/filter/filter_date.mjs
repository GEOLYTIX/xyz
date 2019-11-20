export default _xyz => (layer, filter_entry) => {

  // Reset deselected filter
  if(filter_entry.el && filter_entry.el.parentNode) return _xyz.layers.view.filter.reset(layer, filter_entry);

  const block = _xyz.layers.view.filter.block(layer, filter_entry);

  // identify element with filter field
  block.dataset.field = filter_entry.field;

  // Bind element with filter entry
  filter_entry.el = block;

  // Label for min / greater then control.
  var range = _xyz.utils.wire()`
  <div class="input-flex">
    <span>After`
  
  const input_min = _xyz.utils.wire()`
  <input type="text" readonly>`

  range.appendChild(input_min);

  block.appendChild(range);

  var range = _xyz.utils.wire()`
  <div class="input-flex">
    <span>Before`

  const input_max = _xyz.utils.wire()`
  <input type="text" readonly>`

  range.appendChild(input_max);

  block.appendChild(range);

  _xyz.utils.datePicker({
    element: input_min,
    position: 'c',
    formatter: (input, date) => {

      const meltDateStr = _xyz.utils.meltDateStr(new Date(date));

      input.value = filter_entry.type === 'datetime' ?
        _xyz.utils.formatDateTime(meltDateStr) :
        _xyz.utils.formatDate(meltDateStr);

    },
    onSelect: (instance, date) => applyFilter(),
    onShow: instance => {}
  });

  _xyz.utils.datePicker({
    element: input_max,
    position: 'c',
    formatter: (input, date) => {

      const meltDateStr = _xyz.utils.meltDateStr(new Date(date));

      input.value = filter_entry.type === 'datetime' ?
        _xyz.utils.formatDateTime(meltDateStr) :
        _xyz.utils.formatDate(meltDateStr);

    },
    onSelect: (instance, date) => applyFilter(),
    onShow: instance => {}
  });

  let timeout;

  function applyFilter() {

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // Create filter.
      layer.filter.current[filter_entry.field] = {};
      layer.filter.current[filter_entry.field].gt = _xyz.utils.meltDateStr(input_min.value) || null;
      layer.filter.current[filter_entry.field].lt = _xyz.utils.meltDateStr(input_max.value) || null;

      layer.reload();

      layer.count(n => {

        layer.filter.run_output.disabled = !(n > 1);

        if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();

      })

    }, 500);
  }
};