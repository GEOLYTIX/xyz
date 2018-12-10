import _xyz from '../_xyz.mjs';

export default () => {
  console.log('I am creating layout');

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

  for(let i = 1; i < 6; i++){
    let li = _xyz.utils.createElement({
      tag: 'li',
      appendTo: ul
    });

    _xyz.utils.createElement({
      tag: 'a',
      options: {
        textContent: 'Tab ' + i
      },
      appendTo: li
    });

    _xyz.utils.createElement({
      tag: 'section',
      options: {
        textContent: 'Content ' + i
      },
      appendTo: content
    });
  }

  return container;

};