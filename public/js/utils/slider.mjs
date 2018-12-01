import {createElement} from './createElement.mjs';

// Slider factory.
export function slider(param) {

  createElement({
    tag: 'span',
    options: {
      textContent: param.title
    },
    appendTo: param.appendTo
  });
  
  createElement({
    tag: 'span',
    options: {
      textContent: param.default,
      className: 'bold'
    },
    appendTo: param.appendTo
  });
  
  const range_div = createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: param.appendTo
  });
  
  return createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: param.min,
      value: param.value,
      max: param.max,
      step: param.step || 1,
      oninput: param.oninput,
    },
    appendTo: range_div
  });

}