export default _xyz => {

  let tableview = document.querySelector('.tableview');

  let el = null,
    y_position = 0, 
    y_el = 0,
    min_height;

  let pad = _xyz.utils.createElement({
    tag: 'div',
    options: {
      title: 'Drag to unfold table view. Else double click.',
      className: 'tablepad'
    },
    eventListener: {
      event: 'dblclick',
      funct: () => {
        transition();
      }
    },
    appendTo: tableview
  });

  function transition(){
    let top = parseInt(tableview.style.top) >= 0 ? 'calc(100% - 16px)' : 0;
    tableview.style.transition = '1s';
    tableview.style.top = top;
    tableview.addEventListener('transitionend', e => {
      e.target.style.transition = '';
    });
  }

  function initialize(_el){
    el = _el;
    min_height = el.parentNode.clientHeight - 16;
    y_el = y_position - el.offsetTop;
  }

  function move(e){
    e.preventDefault();
    y_position = el ? e.clientY : e.pageY;
    if(!!el && (y_position - y_el) > -1 && (y_position - y_el) < min_height){
      el.style.top = (y_position - y_el) + 'px';
    }
    document.onmouseup = finish; 
  }

  function finish(e){
    e.target.style.cursor = '';
    if(e.which === 1) {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', finish);
      el = null; 
    }
  }

  pad.addEventListener('mousedown', (e) => {
    if(e.which === 1) {
      e.target.style.cursor = 'grabbing';
      initialize(tableview);
    }
  });

  document.onmousemove = move;

  return tableview;

};