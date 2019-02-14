import create from './create.mjs';

import addTab from './addTab.mjs';

import removeTab from './removeTab.mjs';

import layerTable from './layerTable.mjs';

import locationTable from './locationTable.mjs';

export default _xyz => {

  return {
    
    create: create(_xyz),

    addTab: addTab(_xyz),

    removeTab: removeTab(_xyz),

    layerTable: layerTable(_xyz),

    locationTable: locationTable(_xyz),

  };
    
};