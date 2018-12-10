import _xyz from '../_xyz.mjs';

export default (tableview) => {
  console.log('I am creating layout');

  let tabs_container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'tabs',
      textContent: 'container'
    },
    style: {
      border: '1px dashed red'
    },
    appendTo: tableview
  });
};