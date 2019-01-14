import _xyz from '../../_xyz.mjs';
import Tabulator from 'tabulator-tables';

export default layer => {

  _xyz.tableview.requestData(layer, setData);
};


function setData(layer, data, columns){

  //let tableHeight = (window.innerHeight - 185) + 'px';
  let tableHeight = layer.tableview.holder.clientHeight + 'px';

  layer.tableview.container.innerHTML = '';

  layer.tableview.offset = 0;
        
  if(data.length){

    if(!layer.tableview.download) _xyz.tableview.download(layer);

    layer.tableview.table = new Tabulator(layer.tableview.container, {
      height: _xyz.tableview.height || '30vh',
      //height: (layer.tableview.section.clientHeight - 185) + 'px',
      columns: columns,
      autoResize: true,
      resizableRows: true,
      dataLoaded: function(){ 
        //freeze first row on data load
        /*let firstRow = this.getRows()[0];
                    if(firstRow) firstRow.freeze();*/
      }
    });

    layer.tableview.table.setData(data);
    layer.tableview.note.textContent = 'Showing ' + data.length + ' results.';

    if(layer.tableview.more){
        
      layer.tableview.more.style.display = (data.length < 99 ? 'none' : 'inline');
    
    } else {
        
      /*layer.tableview.more = _xyz.utils.createElement({
        tag: 'div',
        options: {
          className: 'btn_inline',
          textContent: 'Load more'
        },
        style: {
          display: (data.length < 99 ? 'none' : 'inline-block')
        },
        eventListener: {
          event: 'click',
          funct: () => {
            _xyz.tableview.addData(layer);
          }
        },
        appendTo: layer.tableview.section
      });*/

      layer.tableview.more = _xyz.utils.createElement({
        tag: 'div',
        options: {
          textContent: 'Load more',
          classList: 'load_more'
        },
        style: {
          display: (data.length < 99 ? 'none' : 'inline')/*,
          marginLeft: '3px',
          color: '#090',
          cursor: 'pointer'*/
        },
        eventListener: {
          event: 'click',
          funct: () => {
            _xyz.tableview.addData(layer);
          }
        },
        appendTo: layer.tableview.note_container
      });

    }
    
    
  } else {

    layer.tableview.download = false;
        
    layer.tableview.section.innerHTML = '';
        
    _xyz.tableview.refresh(layer);

    layer.tableview.note.textContent = 'No results.';

  }

}