import utils from './utils/_utils.mjs';

import observe from './observer.mjs';

import tableview from './tableview.mjs';

import layout from './layout.mjs';

import nav from './nav.mjs';

export default _xyz => {

  utils(_xyz);
    
  _xyz.tableview.init = () => {

    if(!Object.values(_xyz.layers.list).some(layer => !!layer.tab)) return;
    
    _xyz.tableview.observe = observe;
      
    _xyz.view.desktop = {};

    _xyz.view.desktop.tableview = tableview(_xyz);

    _xyz.view.desktop.tableview.appendChild(layout(_xyz));
    
    nav(_xyz);
  };

};