import _xyz from '../../_xyz.mjs';

export default layer => {

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  _xyz.tableview.setData(layer);

  _xyz.tableview.observe();

  return layer.tableview.container;
};


