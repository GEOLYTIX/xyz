import filter_reset from './filter_reset.mjs';

export default (_xyz, layer, filter_entry) => {

  // Reset deselected filter
  if(filter_entry.el && filter_entry.el.parentNode) return filter_reset(layer, filter_entry);

  const xhr = new XMLHttpRequest();

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open(
    'GET',
    _xyz.host + '/api/location/field/range?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.tableCurrent(),
      field: filter_entry.field,
      filter: JSON.stringify(filter),
      token: _xyz.token}));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    const field_range = e.target.response;

    const block = layer.filter.block(filter_entry);

    // identify element with filter field
    block.dataset.field = filter_entry.field;

    // Bind element with filter entry
    filter_entry.el = block;

    const step = filter_entry.type === 'integer' ? 1 : 0.01;
     
    // Label for min / greater then control.   
    block.appendChild(_xyz.utils.wire()`<div class="range-label">Greater or equal`);

    const input_min = _xyz.utils.wire()`
    <input
      class="range-input"
      type="number"
      min=${field_range.min}
      value=${field_range.min}
      max=${field_range.max}
      step=${step}
      onkeyup=${e=>{
        slider_min.value = e.target.value;
        applyFilter();}}>`;

    block.appendChild(input_min);

    var div_min = _xyz.utils.wire()`<div class="range">`;
    block.appendChild(div_min);

    const slider_min = _xyz.utils.wire()`
    <input
      type="range"
      min=${field_range.min}
      value=${field_range.min}
      max=${field_range.max}
      step=${step}
      oninput=${e=>{
        input_min.value = e.target.value;
        applyFilter();}}>`;

    div_min.appendChild(slider_min);
  
    // Label for max / smaller then control.
    block.appendChild(_xyz.utils.wire()`<div class="range-label">Smaller or equal`);

    const input_max = _xyz.utils.wire()`
    <input
      class="range-input"
      type="number"
      min=${field_range.min}
      value=${field_range.max}
      max=${field_range.max}
      step=${step}
      onkeyup=${e=>{
        slider_max.value = e.target.value;
        applyFilter();}}>`;

    block.appendChild(input_max);

    var div_max = _xyz.utils.wire()`<div class="range">`;
    block.appendChild(div_max);

    const slider_max = _xyz.utils.wire()`
    <input
      type="range"
      min=${field_range.min}
      value=${field_range.max}
      max=${field_range.max}
      step=${step}
      oninput=${e=>{
        input_max.value = e.target.value;
        applyFilter();}}>`;

    div_max.appendChild(slider_max);


    // Use timeout to debounce applyFilter from multiple and slider inputs.
    let timeout;

    function applyFilter(){

      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        timeout = null;

        // Create filter.
        layer.filter.current[filter_entry.field] = {};
        layer.filter.current[filter_entry.field].gte = parseFloat(input_min.value);
        layer.filter.current[filter_entry.field].lte = parseFloat(input_max.value);

        layer.reload();

        layer.count(n => {

          layer.filter.run_output.disabled = !(n > 1);
      
          if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();
      
        })

      }, 500);
    }

  };

  xhr.send(); 
};