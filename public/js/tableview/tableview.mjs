export default _xyz => {

  let
    el = null,
    y_position = 0,
    y_el = 0,
    min_height;

  // let pad = _xyz.utils.createElement({
  //   tag: 'div',
  //   options: {
  //     title: 'Drag to unfold table view. Else double click.',
  //     className: 'tablepad'
  //   },
  //   eventListener: {
  //     event: 'dblclick',
  //     funct: () => transition()
  //   },
  //   appendTo: _xyz.tableview.container
  // });

  let container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'tabs'
    },
    appendTo: _xyz.tableview.container
  });

  let nav = _xyz.utils.createElement({
    tag: 'nav',
    appendTo: container
  });

  _xyz.utils.createElement({
    tag: 'ul',
    appendTo: nav
  });

  _xyz.tableview.contentWrap = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'content-wrap'
    },
    appendTo: container
  });

  function transition() {
    let top = parseInt(_xyz.tableview.container.style.top) >= 0 ? 'calc(100% - 16px)' : 0;
    _xyz.tableview.container.style.transition = '1s';
    _xyz.tableview.container.style.top = top;
    _xyz.tableview.container.addEventListener('transitionend', e => {
      e.target.style.transition = '';
    });
  }

  function initialize(_el) {
    el = _el;
    min_height = el.parentNode.clientHeight - 16;
    y_el = y_position - el.offsetTop;
  }

  function move(e) {
    e.preventDefault();
    y_position = el ? e.clientY : e.pageY;
    if (!!el && (y_position - y_el) > -1 && (y_position - y_el) < min_height) {
      el.style.top = (y_position - y_el) + 'px';
    }
    document.onmouseup = finish;
  }

  function finish(e) {
    e.target.style.cursor = '';
    if (e.which === 1) {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', finish);
      el = null;
    }
  }

  pad.addEventListener('mousedown', e => {
    if (e.which === 1) {
      e.target.style.cursor = 'grabbing';
      initialize(_xyz.tableview.container);
    }
  });

  document.onmousemove = move;

};