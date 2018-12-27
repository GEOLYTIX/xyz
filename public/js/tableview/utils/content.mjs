import _xyz from '../../_xyz.mjs';

export default layer => {

  _xyz.tableview.download(layer);

  _xyz.tableview.refresh(layer);

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  _xyz.tableview.setData(layer);

  return layer.tableview.section;
};


