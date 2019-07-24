import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import zoomToExtent from './zoomToExtent.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

import view from './view/_view.mjs';

export default _xyz => layer => {

  layer.tableCurrent = tableCurrent(_xyz);
    
  layer.tableMin = tableMin(_xyz);
  
  layer.tableMax = tableMax(_xyz);

  layer.zoomToExtent = zoomToExtent(_xyz);
  
  layer.show = show(_xyz);
  
  layer.remove = remove(_xyz);

  layer.view = view(_xyz);

  layer.get = _xyz.layers.format(layer);

  if (layer.style && layer.style.themes) layer.style.theme = layer.style.themes[Object.keys(layer.style.themes)[0]];

  return layer;

};