import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const block = create_block(_xyz, layer, filter_entry);

  block.appendChild(_xyz.utils.wire()`
  <input placeholder="Search" onkeyup=${e=>{

    layer.filter.current[filter_entry.field] = {};
    layer.filter.current[filter_entry.field][filter_entry.filter] = e.target.value;

    layer.show();

    layer.count(n => {

      layer.filter.run_output.disabled = !(n > 1);
  
      if (filter_entry.filterZoom && n > 1) layer.zoomToExtent();
  
    })

  }}>`);
  
};