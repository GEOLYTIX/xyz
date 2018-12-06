import _xyz from './_xyz.mjs';

export default () => {

  //_xyz.view.desktop.tableview = {}; // ?

  let tableview = document.querySelector('.tableview'),
    el = null,
    y_position = 0, 
    y_el = 0,
    min_height;

  //tableview.addEventListener('mouseover', e => {
  // e.target.style.cursor = 'ns-resize';
  //});

    /*let header = _xyz.utils.createElement({
        tag: 'div',
        appendTo: tableview
    });*/

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      classList: 'material-icons expander',
      textContent: 'unfold_more'
    },
    eventListener: {
      event: 'click',
      funct: e => {
        tableview.classList.toggle('expanded'); 
        //tableview.classList.add('folded');
        e.target.textContent === 'unfold_more' ? e.target.textContent = 'unfold_less' : e.target.textContent = 'unfold_more';
        //tableview.classList.remove('folded');
        /*if(e.target.textContent === 'unfold_more'){
                   e.target.textContent = 'unfold_less'
               } else {
                   e.target.textContent = 'unfold_more';
               }*/
        /*e.target.textContent === 'unfold_more' ? 
               (e.target.textContent = 'unfold_less', tableview.classList.add('expanded')) : 
               (e.target.textContent = 'unfold_more', tableview.style.transition = '1s', tableview.style.top = min_height);*/
      } 
    },
    appendTo: tableview
  });

  function foldTable(){ // write function that folds the table
    //tableview.style.
  }

  function start_drag(_el){
    el = _el;
    min_height = el.parentNode.clientHeight - 25;
    y_el = y_position - el.offsetTop;
    el.style.cursor = 'ns-resize';
  }

  function move(e){ 
    y_position = el ? window.event.clientY : e.pageY;
    if(!!el && (y_position - y_el) > -1 && (y_position - y_el) < min_height){
      el.style.top = (y_position - y_el) + 'px'; 
    }
  }

  function finish(){ 
    el = null; 
  }

  tableview.addEventListener('mousedown', () => {
    start_drag(tableview);
    return false;
  });

  document.onmousemove = move;
  document.onmouseup = finish;
};