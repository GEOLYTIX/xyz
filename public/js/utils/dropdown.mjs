import { createElement } from './createElement.mjs';

// Dropdown factory.
export function dropdown(param) {

  if (param.title) createElement({
    tag: 'div',
    options: {
      textContent: param.title
    },
    appendTo: param.appendTo
  });

  const _select = createElement({
    tag: 'select',
    appendTo: param.appendTo
  });

  if (param.entries.length) {

    // Create select options from entries Array.
    param.entries.forEach(entry => {
      createElement({
        tag: 'option',
        options: {

          // Assign first value as text if entry is object.
          textContent: typeof (entry) == 'object' ? entry[param.label] || Object.values(entry)[0] : entry,
          
          // Assign first key as value if entry is object.
          value: typeof (entry) == 'object' ? entry[param.val] || Object.keys(entry)[0] : entry
        },
        appendTo: _select
      });
    });

  } else {

    // Create select options from Object if length is undefined.
    Object.keys(param.entries).forEach(entry => {
      createElement({
        tag: 'option',
        options: {
          textContent: param.label ? param.entries[entry][param.label] || entry : entry,
          value: param.val ? param.entries[entry][param.val] || entry : entry
        },
        appendTo: _select
      });
    });
  }

  _select.disabled = (_select.childElementCount === 1);

  _select.onchange = param.onchange;

  // Get the index of the selected option from the select element.
  if (!param.selected) _select.selectedIndex = 0;

  for (let i = 0; i < _select.length; i++) {
    if (_select[i].value == param.selected) _select.selectedIndex = i;
  }

  return _select;

}