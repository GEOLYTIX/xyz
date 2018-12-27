import _xyz from '../_xyz.mjs';

import * as utils from './utils/_utils.mjs';

import tableview from './tableview.mjs';
import layout from './layout.mjs';
import nav from './nav.mjs';

export default () => {
    
  if(!Object.values(_xyz.layers.list).some(layer => { return layer.tab === true; })) return;

  _xyz.tableview = utils;
    
  _xyz.view.desktop = {};
  _xyz.view.desktop.tableview = tableview();
  _xyz.view.desktop.tableview.appendChild(layout());
  nav();

};
