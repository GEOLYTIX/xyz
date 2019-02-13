import create from './create.mjs';

import addTab from './addTab.mjs';

import removeTab from './removeTab.mjs';

import locationTable from './locationTable.mjs';

import layerTable from './layerTable.mjs';


export default _xyz => {

  return {
    
    create: create(_xyz),

    addTab: addTab(_xyz),

    removeTab: removeTab(_xyz),

    locationTable: locationTable(_xyz),

    layerTable: layerTable(_xyz)


  };
    
};