import _xyz from '../_xyz.mjs';
import Tabulator from 'tabulator-tables';
import Refresh from './refresh.mjs';
import RequestData from './requestData.mjs';
import AddData from './addData.mjs';

export default layer => {

  RequestData(layer, setData);
};


function setData(layer, columns, data){

  let tableHeight = (window.innerHeight - 185) + 'px';

  layer.tableview.container.innerHTML = '';

  layer.tableview.offset = 0;
        
  if(data.length){

    layer.tableview.table = new Tabulator(layer.tableview.container, {
      height: tableHeight,
      columns: columns,
      dataLoaded: function(){ 
        //freeze first row on data load
        /*let firstRow = this.getRows()[0];
                    if(firstRow) firstRow.freeze();*/
      }
    });

    layer.tableview.table.setData(data);
    layer.tableview.container.previousSibling.textContent = 'Showing ' + data.length + ' results.';
  
    if(!layer.tableview.more) layer.tableview.more = _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'btn_inline',
        textContent: 'Load more'
      },
      eventListener: {
        event: 'click',
        funct: () => {
          console.log('load more data and hide button if no more.');
          layer.tableview.offset = parseInt(layer.tableview.offset) + 1;
          console.log(layer.tableview.offset); 
        }
      },
      appendTo: layer.tableview.container.parentNode
    });
    
    
  } else {
        
    layer.tableview.section.innerHTML = '';
        
    Refresh(layer);

    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: 'No results.'
      },
      style: {
        fontSize: '12px',
        padding: '2px',
        marginTop: '5px'
      },
      appendTo: layer.tableview.section
    });
  }
}