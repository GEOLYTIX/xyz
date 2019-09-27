import create from './create.mjs';

import addTab from './addTab.mjs';

import removeTab from './removeTab.mjs';

import locationTable from './locationTable.mjs';

import orderedList from './orderedList.mjs';

import dashboard from './dashboard.mjs';

import layerTable from './layerTable.mjs';

import layerDashboard from './layerDashboard.mjs';

import tableContainer from './tableContainer.mjs';

import resizeObserve from './resizeObserve.mjs';

import pgFunction from './pgFunction.mjs';

import groupColumns from './groupColumns.mjs';

export default _xyz => {

  return {

    tables: [],
    
    create: create(_xyz),

    addTab: addTab(_xyz),

    removeTab: removeTab(_xyz),

    locationTable: locationTable(_xyz),

    orderedList: orderedList(_xyz),

    dashboard: dashboard(_xyz),

    layerTable: layerTable(_xyz),

    layerDashboard: layerDashboard(_xyz),

    tableContainer: tableContainer(_xyz),

    resizeObserve: resizeObserve(_xyz),

    pgFunction: pgFunction(_xyz),

    groupColumns: groupColumns(_xyz)

  };
    
};