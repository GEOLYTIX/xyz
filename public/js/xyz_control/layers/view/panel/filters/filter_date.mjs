export default (_xyz, layer, filter_entry) => {

  const block = layer.filter.block(filter_entry);

  // Label for min / greater then control.
  block.appendChild(_xyz.utils.wire()`
  <div class="range-label">After`);

  const input_min = _xyz.utils.wire()`
  <input type="text" class="range-input" readonly>`
  block.appendChild(input_min);

  // separator container
  block.appendChild(_xyz.utils.wire()`
  <div style="width: 100%; height: 10px">`);

  block.appendChild(_xyz.utils.wire()`
  <div class="range-label">Before`);

  const input_max = _xyz.utils.wire()`
  <input type="text" class="range-input" readonly>`
  block.appendChild(input_max);

  _xyz.utils.datePicker({
    element: input_min,
    position: 'c',
    formatter: (input, date) => {

      const meltDateStr = _xyz.utils.meltDateStr(new Date(date));

      input.value = filter_entry.type === 'datetime' ?
        _xyz.utils.formatDateTime(meltDateStr) :
        _xyz.utils.formatDate(meltDateStr);

    },
    onSelect: (instance, date) => {
      applyFilter();
      instance.calendar.style.top = '-10000px';
    },
    onShow: instance => {
      const yPosition = instance.el.getBoundingClientRect().top;
      instance.calendar.style.top = (yPosition - 100) + 'px';
    }
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
    onSelect: (instance, date) => {
      applyFilter();
      instance.calendar.style.top = '-10000px';
    },
    onShow: instance => {
      const yPosition = instance.el.getBoundingClientRect().top;
      instance.calendar.style.top = (yPosition - 100) + 'px';
    }
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