import create from './create.mjs';

import addTab from './addTab.mjs';

import layerTable from './layerTable.mjs';

import locationTable from './locationTable.mjs';

import updateTable from './updateTable.mjs';

export default _xyz => {

  return {
    
    create: create(_xyz),

    addTab: addTab(_xyz),

    layerTable: layerTable(_xyz),

    locationTable: locationTable(_xyz),

    updateTable: updateTable(_xyz)

  };
    
};