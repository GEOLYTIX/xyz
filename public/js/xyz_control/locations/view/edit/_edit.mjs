import range from './range.mjs';

import options from './options.mjs';

import suboptions from './suboptions.mjs';

import date from './date.mjs';

import optionsTextInput from './optionsTextInput.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    range: range(_xyz),

    date: date(_xyz),

    options: options(_xyz),

    suboptions: suboptions(_xyz),

    optionsTextInput: optionsTextInput(_xyz),

  };

  if(!entry.edit) return;

  // Create a date control.
  if (entry.type === 'date') return entry.ctrl.date(entry);

  // Create range input for range fields.
  if (entry.edit.range) return entry.ctrl.range(entry);

  // Create select input for options.
  if (entry.edit.options) return entry.ctrl.options(entry);

  // Create select input for asscoiated options.
  if (entry.edit.options_field) return entry.ctrl.suboptions(entry);

  // Create a 3 line textarea for textarea type entry.
  if (entry.type === 'textarea') {
    let textArea = _xyz.utils.wire()`
    <textarea value=${entry.value || ''} rows=3
    onkeyup=${
      e => {
        entry.location.view.valChange({input: e.target, entry: entry});
      }
    }>`;

    entry.val.appendChild(textArea);

    return textArea;
  }

  // Create a text input if no other rule applies.
  entry.val.appendChild(_xyz.utils.wire()`
    <input type="text" value="${entry.value || ''}"
    onkeyup=${
      e => {
        entry.location.view.valChange({input: e.target, entry: entry});
      }
    }
    >`);

};