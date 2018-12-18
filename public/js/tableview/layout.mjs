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

      layer.tab_section = _xyz.utils.createElement({
        tag: 'section',
        options: {
          //textContent: 'This is section for layer ' + layer.name + '.'
        },
        appendTo: content
      });

      /*let spinner = _xyz.utils.createElement({
        tag: 'div',
        options: {
          className: 'spinner'
        },
        style: {
          paddingTop: '30px'
        },
        appendTo: layer.tab_section
      });

      for(let i = 1; i < 4; i++){
        _xyz.utils.createElement({
          tag: 'div',
          options: {
            className: 'bounce' + i 
          },
          appendTo: spinner
        });
      }*/

    }
  });

  ul.lastChild.appendChild(_xyz.utils.createElement({tag: 'div'}));

  return container;

};