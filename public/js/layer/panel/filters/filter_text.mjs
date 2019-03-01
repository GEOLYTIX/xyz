import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const block = create_block(_xyz, layer, filter_entry);

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

        layer.show();
        
        if (layer.filter.infoj) layer.filter.run_output.style.display = 'block';


      }
    }
  });
  
};