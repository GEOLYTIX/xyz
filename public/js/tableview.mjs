import _xyz from './_xyz.mjs';

export default () => {

  //_xyz.view.desktop.tableview = {}; // ?

  let tableview = document.querySelector('.tableview'),
    el = null,
    y_position = 0, 
    y_el = 0,
    min_height;

  let expander = _xyz.utils.createElement({
    tag: 'i',
    options: {
      classList: 'material-icons expander',
      textContent: 'unfold_less'
    },
    eventListener: {
      event: 'click',
      funct: e => {
        transition();
      } 
    },
    appendTo: tableview
  });

  function transition(){
    let top = 'calc(100% - 25px)';
    tableview.style.transition = '1s';
    tableview.style.top = top;
    tableview.addEventListener('transitionend', e => {
      expander.style.opacity = 0;
      expander.style.display = 'none';
      e.target.style.transition = '';
    });
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
    document.onmouseup = finish; 
  }

  function finish(){
    expander.style.opacity = 1;
    expander.style.display = 'block';
    el = null; 
    return false;
  }

  tableview.addEventListener('mousedown', () => {
    start_drag(tableview);
  });

  document.onmousemove = move;

};