import _xyz from '../_xyz.mjs';
import RequestData from './requestData.mjs';

export default layer => {

  RequestData(layer, addData);
};

function addData(layer, columns, data){
  if(data.length){
    layer.tableview.table.addData(data);
  }
}