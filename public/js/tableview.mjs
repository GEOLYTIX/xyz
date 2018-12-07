import _xyz from './_xyz.mjs';

export default () => {

  //_xyz.view.desktop.tableview = {}; // ?

  let tableview = document.querySelector('.tableview'),
    el = null,
    y_position = 0, 
    y_el = 0,
    min_height;

  tableview.addEventListener('transisionend', e => {
    console.log('transision complete');
  });

  let expander = _xyz.utils.createElement({
    tag: 'i',
    options: {
      classList: 'material-icons expander',
      //textContent: 'unfold_more'
      textContent: 'unfold_less'
    },
    eventListener: {
      event: 'click',
      funct: e => {
        transition('less');
        /*if(e.target.textContent === 'unfold_more'){
          e.target.textContent = 'unfold_less';
          transition('more');
        } else {
          e.target.textContent = 'unfold_more';
          transition('less');
        }*/
      } 
    },
    appendTo: tableview
  });

  function transition(top){
    top = top === 'less' ?  'calc(100% - 25px)' : 0;
    tableview.style.transition = '1s';
    tableview.style.top = top;
    tableview.addEventListener('transitionend', e => {
      e.target.style.transition = '';
      expander.style.opacity = 0;
      expander.style.display = 'none';
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
  }

  function finish(){ 
    el = null; 
    expander.style.opacity = 1;
    expander.style.display = 'block';
  }

  tableview.addEventListener('mousedown', () => {
    start_drag(tableview);
    return false;
  });

  document.onmousemove = move;
  document.onmouseup = finish;
};