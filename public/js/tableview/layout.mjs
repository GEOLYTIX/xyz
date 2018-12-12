import _xyz from '../_xyz.mjs';
import tab_content from './content.mjs';

export default () => {

  let container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'tabs'
    },
    style: {
      border: '1px dashed orange'
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

      let section = _xyz.utils.createElement({ // this is where data should be loaded
        tag: 'section',
        options: {
          textContent: 'This is section for layer ' + layer.name + '.'
        },
        appendTo: content
      });

      //section.appendChild(tab_content(layer));
      tab_content(layer, section);
    }
  });

  ul.lastChild.appendChild(_xyz.utils.createElement({tag: 'div'}));

  return container;

};