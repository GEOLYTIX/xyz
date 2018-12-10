import _xyz from '../_xyz.mjs';

export default () => {

  //_xyz.view.desktop.tableview = {}; // ?
  _xyz.view.desktop = {};

  _xyz.view.desktop.tableview = document.querySelector('.tableview');

  let el = null,
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
    appendTo: _xyz.view.desktop.tableview
  });

  function transition(){
    let top = 'calc(100% - 25px)';
    _xyz.view.desktop.tableview.style.transition = '1s';
    _xyz.view.desktop.tableview.style.top = top;
    _xyz.view.desktop.tableview.addEventListener('transitionend', e => {
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

  _xyz.view.desktop.tableview.addEventListener('mousedown', () => {
    start_drag(_xyz.view.desktop.tableview);
  });

  document.onmousemove = move;

};