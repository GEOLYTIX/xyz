import create from './create.mjs';

import addTab from './addTab.mjs';

import layerTable from './layerTable.mjs';

import updateTable from './updateTable.mjs';

export default _xyz => {

  return {
    
    create: create(_xyz),

    addTab: addTab(_xyz),

    layerTable: layerTable(_xyz),

    updateTable: updateTable(_xyz),

  };
    
};