import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

import view from './view.mjs';

import load from './load.mjs';

export default _xyz => () => ({
  
  tableCurrent: tableCurrent(_xyz),
    
  tableMin: tableMin(_xyz),
  
  tableMax: tableMax(_xyz),
  
  show: show(_xyz),
  
  remove: remove(_xyz),

  view: view(_xyz),

  load: load(_xyz),

});