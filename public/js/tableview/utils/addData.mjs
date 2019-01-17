/*import _xyz from '../../_xyz.mjs';

export default layer => {
    
  layer.tableview.offset = parseInt(layer.tableview.offset) + 1;
  _xyz.tableview.requestData(layer, addData);

};*/

export default _xyz => {
  
  return layer => _xyz.tableview.requestData(layer, addData);

  function addData(layer, data){
    layer.tableview.offset = parseInt(layer.tableview.offset) + 1;
    if(data.length){
      layer.tableview.more.style.display = (data.length < 99 ? 'none' : 'inline-block');
      layer.tableview.table.addData(data, false);
      layer.tableview.note.textContent = 'Showing ' + (99*layer.tableview.offset + data.length) + ' results.';
    } else {
      layer.tableview.more.style.display = 'none';
    }
  }

};