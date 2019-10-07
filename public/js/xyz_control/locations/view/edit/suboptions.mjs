export default _xyz => entry => {

  // Get the associated entry for the prime select.
  const _entry = Object.values(entry.location.infoj).find(_entry => _entry.field === entry.edit.options_field);

  const _options = typeof _entry.edit.options[_entry.select.selectedIndex] === 'object'
        && _entry.edit.options[_entry.select.selectedIndex][_entry.value] !== 'text' ?
    Object.values(_entry.edit.options[_entry.select.selectedIndex][_entry.select.value])
    : [''];

    // Create a select dropdown for the suboptions field.
  entry.select = _xyz.utils.dropdown({
    appendTo: entry.val,
    entries: _options,
    selected: entry.value,
    onchange: e => {

      // Set newValue and compare with current value.
      entry.location.view.valChange({input: e.target, entry: entry});

    }
  });

  // Assign onchange event for the prime select dropdown.
  _entry.select.onchange = e => {

    // Call value change event for the prime select.
    //valChange(e.target, location, _entry);

    // Remove the custom text input.
    if (_entry.select_other) _entry.select_other.remove();

    // Create a custom text input
    entry.ctrl.optionsTextInput(_entry);

    // Remove options from suboptions select.
    entry.select.innerHTML = '';

    // Get the selected option from the prime select dropdown.
    const _options = _entry.edit.options[_entry.select.selectedIndex];

    // Add suboptions if the select prime option is an object.
    if (typeof _options[_entry.select.value] === 'object') Object.values(_options[_entry.select.value]).forEach(option => {

      let opt = _xyz.utils.wire()`<option>${option}`;

      opt.value = option;

      entry.select.appendChild(opt);

      entry.select.add(opt);

      /*entry.select.add(_xyz.utils.createElement({
        tag: 'option',
        options: {
          textContent: option,
          value: option
        },
        appendTo: entry.select
      }));*/

    });

    // Disable the suboptions select when there is only one or none option.
    entry.select.disabled = (entry.select.childElementCount <= 1);

    // Call value change event for the suboptions.
    entry.location.view.valChange({input: entry.select, entry: entry});

  };

};