
import setData from './setData.mjs';
import Refresh from './refresh.mjs';
import Download from './download.mjs';

export default layer => {

  Download(layer);

  Refresh(layer);

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  setData(layer);

  return layer.tableview.section;
};


