import _xyz from '../../../_xyz.mjs';

import create_block from './create_block.mjs';

export default (layer, filter_entry) => {

  const block = create_block(layer, filter_entry);

  // Label for min / greater then control.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'range-label',
      textContent: 'After ',
    },
    appendTo: block
  });

  const input_min = _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'range-input',
      type: 'text'
    },
    appendTo: block
  });

  // separator container
  _xyz.utils.createElement({ 
    tag: 'div',
    appendTo: block,
    style: {
      width: '100%',
      height: '10px'
    }
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'range-label',
      textContent: 'Before ',
    },
    appendTo: block
  });

  const input_max = _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'range-input',
      type: 'text'
    },
    appendTo: block
  });

  _xyz.utils.datePicker(input_min, layer, filter_entry, applyFilter);
  
  _xyz.utils.datePicker(input_max, layer, filter_entry, applyFilter);

  let timeout;

  function applyFilter(){

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // Create filter.
      layer.filter.current[filter_entry.field] = {};
      layer.filter.current[filter_entry.field].gt = _xyz.utils.meltDateStr(input_min.value) || null;
      layer.filter.current[filter_entry.field].lt = _xyz.utils.meltDateStr(input_max.value) || null;

      console.log(layer.filter);

      // Reload layer.
      layer.get();

      if (layer.filter.infoj) layer.filter.run_output.style.display = 'block';

    }, 500);
  }
};