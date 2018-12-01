import _xyz from '../../../_xyz.mjs';

import create_block from './create_block.mjs';

export default (layer, filter_entry) => {

  const block = create_block(layer, filter_entry);

  _xyz.utils.createElement({
    tag: 'input',
    options: {
      placeholder: 'Search.',
    },
    appendTo: block,
    eventListener: {
      event: 'keyup',
      funct: e => {

        // Create filter.
        layer.filter.current[filter_entry.field] = {};
        layer.filter.current[filter_entry.field][filter_entry.filter] = e.target.value;

        // Reload layer.
        layer.get();
        if (layer.filter.infoj) layer.filter.run_output.style.display = 'block';


      }
    }
  });
  
};