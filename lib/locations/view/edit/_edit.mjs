import range from './range.mjs';

import options from './options.mjs';

import date from './date.mjs';

import textarea from './textarea.mjs';

export default _xyz => {
  
  const edit = {

    input: input,

    range: range(_xyz),

    date: date(_xyz),

    options: options(_xyz),

    textarea: textarea(_xyz)

  };

  return edit;

  function input(entry) {

    if(!entry.edit) return;

    // Create a date control.
    if (entry.type === 'date' || entry.type === 'datetime') return edit.date(entry);

    // Create range input for range fields.
    if (entry.edit.range) return edit.range(entry);

    // Create select input for options.
    if (entry.edit.options) return edit.options(entry);

    if (entry.type === 'textarea' || entry.type === 'html') return edit.textarea(entry);
    

    // Create a text input if no other rule applies.
    entry.val.appendChild(_xyz.utils.wire()`
    <input type="${(entry.type === 'numeric' || entry.type === 'integer') && 'number' || 'text'}" value="${entry.value || entry.displayValue || ''}"
      onkeyup=${e => {
        entry.location.view.dispatchEvent(
          new CustomEvent('valChange', {detail:{
            input: e.target,
            entry: entry,
          }}))
      }}>`);

  }

};