import _xyz from '../../../_xyz.mjs';

import valChange from './valChange.mjs';

import optionsTextInput from './optionsTextInput.mjs';

export default (record, entry) => {

  // Map first level options and keys to the options object.
  const options = entry.edit.options.map(option => {

    // Return the first key when there are suboptions.
    if (typeof option === 'object') return Object.keys(option)[0];

    // Return the option text when there are no suboptions.
    return option;
  });

  // Unshift the entry value if not in options array.
  options.indexOf(entry.value) < 0
    && options.unshift(entry.value)
    && entry.edit.options.unshift(entry.value);

  // Pass options object to the dropdown factory.
  entry.select = _xyz.utils.dropdown({
    appendTo: entry.val,
    entries: options,
    selected: entry.value,
    onchange: e => {

      // Set newValue and compare with current value.
      valChange(e.target, record, entry);

      // Remove the custom text input.
      if (entry.select_other) entry.select_other.remove();

      optionsTextInput(entry, record);

    }
  });

  optionsTextInput(entry, record);

};