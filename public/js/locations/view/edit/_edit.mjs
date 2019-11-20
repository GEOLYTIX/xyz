import range from './range.mjs';

import options from './options.mjs';

import date from './date.mjs';

export default _xyz => {
  
  const edit = {

    input: input,

    range: range(_xyz),

    date: date(_xyz),

    options: options(_xyz),

  };

  return edit;

  function input(entry) {

    if(!entry.edit) return;

    // Create a date control.
    if (entry.type === 'date') return edit.date(entry);

    // Create range input for range fields.
    if (entry.edit.range) return edit.range(entry);

    // Create select input for options.
    if (entry.edit.options) return edit.options(entry);

    // Create a 3 line textarea for textarea type entry.
    if (entry.type === 'textarea') {
      let textArea = _xyz.utils.wire()`
      <textarea value=${entry.value || ''} rows=3
        onkeyup=${e => {
          entry.location.view.dispatchEvent(
            new CustomEvent('valChange', {detail:{
              input: e.target,
              entry: entry,
            }}))
        }}>`;

      entry.val.appendChild(textArea);

      return textArea;
    }

    // Create a text input if no other rule applies.
    entry.val.appendChild(_xyz.utils.wire()`
    <input type="text" value="${entry.value || ''}"
      onkeyup=${e => {
        entry.location.view.dispatchEvent(
          new CustomEvent('valChange', {detail:{
            input: e.target,
            entry: entry,
          }}))
      }}>`);

  }

};