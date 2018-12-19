import _xyz from '../_xyz.mjs';

export default () => {

  let container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'tabs'
    }
  });

  let nav = _xyz.utils.createElement({
    tag: 'nav',
    appendTo: container
  });

  let ul = _xyz.utils.createElement({
    tag: 'ul',
    appendTo: nav
  });

  let content = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'content-wrap'
    },
    appendTo: container
  });

  Object.values(_xyz.layers.list).map(layer => {
    if(layer.tab){

      layer.tableview = {};

      let li = _xyz.utils.createElement({
        tag: 'li',
        appendTo: ul
      });
          
      _xyz.utils.createElement({
        tag: 'a',
        options: {
          textContent: layer.name
        },
        appendTo: li
      });

      layer.tableview.section = _xyz.utils.createElement({
        tag: 'section',
        appendTo: content
      });
    }
  });

  ul.lastChild.appendChild(_xyz.utils.createElement({tag: 'div'}));

  return container;

};