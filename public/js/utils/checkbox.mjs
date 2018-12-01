import {createElement} from './createElement.mjs';

// Checkbox factory.
export function checkbox(param) {

  const checkbox = createElement({
    tag: 'label',
    options: {
      textContent: param.label,
      className: 'checkbox'
    },
    appendTo: param.appendTo
  });
  
  const input = createElement({
    tag: 'input',
    options: {
      type: 'checkbox'
    },
    appendTo: checkbox
  });
  
  createElement({
    tag: 'div',
    options: {
      className: 'checkbox_i'
    },
    appendTo: checkbox
  });
  
  if (param.checked) input.checked = true;
  
  if (typeof (param.onChange) === 'function') input.addEventListener('change', param.onChange);

}