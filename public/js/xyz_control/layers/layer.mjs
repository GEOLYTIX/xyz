import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import zoomToExtent from './zoomToExtent.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

import count from './count.mjs';


export default _xyz => layer => {

  layer.tableCurrent = tableCurrent(_xyz);
    
  layer.tableMin = tableMin(_xyz);
  
  layer.tableMax = tableMax(_xyz);

  layer.zoomToExtent = zoomToExtent(_xyz);
  
  layer.show = show(_xyz);
  
  layer.remove = remove(_xyz);

  layer.count = count(_xyz);

  layer.view = {

    loader: _xyz.utils.wire()`<div class="loader" style="display: none">`

  };

  // Set the first theme from themes array.
  if (layer.style && layer.style.themes) layer.style.theme = layer.style.themes[Object.keys(layer.style.themes)[0]];

  _xyz.layers.format[layer.format](layer);

  return layer;

};