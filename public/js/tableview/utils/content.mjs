export default _xyz => {

  //if(!layer.table) layer.table = getTable(layer); // zoom problem
  return layer => {

    _xyz.tableview.setData(layer);

    //_xyz.tableview.observe();
    
    return layer.tableview.container;
  
  };

};