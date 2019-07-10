import {wire} from 'hyperhtml/esm';

// Dropdown factory.
export function dropdown(param) {

  if (param.title) param.appendTo.appendChild(wire()`<div>${param.title}`);
    
  const _select = wire()`<select style=${param.style || ''}>`;

  param.appendTo.appendChild(_select);


  if (param.entries.length) {

    // Create select options from entries Array.
    param.entries.forEach(entry => {

      const v = typeof (entry) == 'object' ? entry[param.val] || Object.keys(entry)[0] : entry;
      
      const h = typeof (entry) == 'object' ? entry[param.label] || Object.values(entry)[0] : entry;

      _select.appendChild(wire()`<option value=${v} textContent=${h}>`);

    });

  } else {

    // Create select options from Object if length is undefined.
    Object.keys(param.entries).forEach(entry => {

      _select.appendChild(wire()`
      <option
        value=${param.val ? param.entries[entry][param.val] || entry : entry}
        textContent=${param.label ? param.entries[entry][param.label] || entry : entry}>`);

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