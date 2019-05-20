import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import zoomToExtent from './zoomToExtent.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

//import hover from './hover.mjs';

import view from './view/_view.mjs';

import load from './load.mjs';

export default _xyz => () => ({
  
  tableCurrent: tableCurrent(_xyz),
    
  tableMin: tableMin(_xyz),
  
  tableMax: tableMax(_xyz),

  zoomToExtent: zoomToExtent(_xyz),
  
  show: show(_xyz),
  
  remove: remove(_xyz),

  view: view(_xyz),

  //hover: hover(_xyz),

  load: load(_xyz),

});