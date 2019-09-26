import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const block = create_block(_xyz, layer, filter_entry);

  block.appendChild(_xyz.utils.wire()`
  <input placeholder="Search" onkeyup=${e=>{

    layer.filter.current[filter_entry.field] = {};
    layer.filter.current[filter_entry.field][filter_entry.filter] = e.target.value;

    layer.filter.check_count(filter_entry.filterZoom);

    layer.show();

  }}>`);
  
};