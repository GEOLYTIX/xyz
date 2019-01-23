import utils from './utils/_utils.mjs';

import tableview from './tableview.mjs';

import layout from './layout.mjs';

import nav from './nav.mjs';

export default _xyz => {

  utils(_xyz);

  _xyz.tableview.init = () => {

    _xyz.tableview.container = document.querySelector('.tableview');

    tableview(_xyz);

    _xyz.tableview.createTable({
      layer: _xyz.layers.list.COUNTRIES,
      target: _xyz.tableview.contentWrap
    });

    

  };
    
  // _xyz.tableview.init = () => {

  //   if(!Object.values(_xyz.layers.list).some(layer => !!layer.tab)) return;
      
  //   _xyz.view.desktop = {};

  //   _xyz.view.desktop.tableview = tableview(_xyz);

  //   _xyz.view.desktop.tableview.appendChild(layout(_xyz));
    
  //   nav(_xyz);

  // };

};