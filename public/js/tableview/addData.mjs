import RequestData from './requestData.mjs';

export default layer => {
    
  layer.tableview.offset = parseInt(layer.tableview.offset) + 1;
  RequestData(layer, addData);
};

function addData(layer, data){
  if(data.length){
    console.log(data);
    console.log(data.length);
    console.log(layer.tableview.offset);
    layer.tableview.table.addData(data, false);
    layer.tableview.container.previousSibling.textContent = 'Showing ' + (99*layer.tableview.offset + data.length) + ' results.';
  }
}