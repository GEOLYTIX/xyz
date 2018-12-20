import RequestData from './requestData.mjs';

export default layer => {
    
  layer.tableview.offset = parseInt(layer.tableview.offset) + 1;
  RequestData(layer, addData);
};

function addData(layer, data){
  if(data.length){
    layer.tableview.more.style.display = (data.length < 99 ? 'none' : 'inline-block');
    layer.tableview.table.addData(data, false);
    layer.tableview.note.textContent = 'Showing ' + (99*layer.tableview.offset + data.length) + ' results.';
  } else {
    layer.tableview.more.style.display = 'none';
  }
}