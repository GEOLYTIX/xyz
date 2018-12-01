import _xyz from '../../../_xyz.mjs';

import create_block from './create_block.mjs';

export default (layer, filter_entry) => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/field/range?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    field: filter_entry.field,
    token: _xyz.token
  }));

  xhr.onload = e => {

    const field_range = JSON.parse(e.target.response);

    const block = create_block(layer, filter_entry);
  
    // Label for min / greater then control.
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'range-label',
        textContent: 'Greater then >',
      },
      appendTo: block
    });
  
    const input_min = _xyz.utils.createElement({
      tag: 'input',
      options: {
        classList: 'range-input',
        type: 'number',
        min: field_range.min,
        max: field_range.max,
        value: field_range.min
      },
      appendTo: block,
      eventListener: {
        event: 'keyup',
        funct: e => {
    
          // Set slider value and apply filter.
          slider_min.value = e.target.value;
          applyFilter();
        }
      }
    });
  
    const slider_min = _xyz.utils.slider({
      min: field_range.min,
      max: field_range.max,
      value: field_range.min,
      appendTo: block,
      oninput: e => {
  
        // Set input value and apply filter.
        input_min.value = e.target.value;
        applyFilter();
      }
    });
  
    // Label for max / smaller then control.
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'range-label',
        textContent: 'Smaller then <'
      },
      appendTo: block
    });
  
    const input_max = _xyz.utils.createElement({
      tag: 'input',
      options: {
        classList: 'range-input',
        type: 'number',
        min: field_range.min,
        max: field_range.max,
        value: field_range.max
      },
      appendTo: block,
      eventListener: {
        event: 'keyup',
        funct: e => {

          // Set slider value and apply filter.
          slider_max.value = e.target.value;
          applyFilter();
        }
      }
    });
  
    const slider_max = _xyz.utils.slider({
      min: field_range.min,
      max: field_range.max,
      value: field_range.max,
      appendTo: block,
      oninput: e => {
  
        // Set input value and apply filter.
        input_max.value = e.target.value;
        applyFilter();
      }
    });

    // Apply max value after the slider has been created.
    slider_max.value = field_range.max;


    // Use timeout to debounce applyFilter from multiple and slider inputs.
    let timeout;

    function applyFilter(){

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;

        // Create filter.
        layer.filter.current[filter_entry.field] = {};
        layer.filter.current[filter_entry.field].gt = parseFloat(input_min.value);
        layer.filter.current[filter_entry.field].lt = parseFloat(input_max.value);

        // Reload layer.
        layer.get();

        if (layer.filter.infoj) layer.filter.run_output.style.display = 'block';

      }, 500);
    }

  };

  xhr.send(); 
};