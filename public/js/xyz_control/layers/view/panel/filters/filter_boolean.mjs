import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const block = create_block(_xyz, layer, filter_entry);

  // Create filter.
  if (!layer.filter.current[filter_entry.field]) {
    layer.filter.current[filter_entry.field] = {};
  }
	
  layer.filter.current[filter_entry.field]['boolean'] = true;

  _xyz.utils.createCheckbox({
    label: filter_entry.name || 'True',
    appendTo: block,
    checked: true,
    onChange: e => {

      if (e.target.checked) {
        layer.filter.current[filter_entry.field]['boolean'] = true;
      } else if(e.target.checked === false){

        layer.filter.current[filter_entry.field]['boolean'] = false;
      }

      layer.filter.check_count(filter_entry.filterZoom);
      layer.show();
    }
  });

  // apply immediately
  layer.filter.check_count();
  layer.show();

};