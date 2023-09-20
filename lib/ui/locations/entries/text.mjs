export default entry => {
  let val = entry.value;

  // Check if the entry is editable.
  if (entry.edit) {
    // If the entry has options, create a dropdown element; otherwise, create an input element.
    if (entry.edit.options) {
      val = createDropdown(entry);
    } else {
      val = createInputElement(entry);
    }
  }

  // Return an HTML element representing the entry.
  return mapp.utils.html.node`
    <div
      class="val"
      style="${entry.css_val || ''}">
      ${entry.prefix}${val}${entry.suffix}`
}

// Function to create an input element based on the provided entry.
function createInputElement(entry) {
  return mapp.utils.html`
    <input
      type="text"
      maxlength=${entry.edit.maxlength}
      value="${entry.value || ''}"
      placeholder="${entry.edit.placeholder || ''}"
      onkeyup=${e => {
        // Update the newValue property in the entry and dispatch a 'valChange' event.
        entry.newValue = e.target.value
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry
          })
        )
      }}>
  `;
}

// Function to create a dropdown element based on the provided entry.
function createDropdown(entry) {
  let chk;
  const distinct = entry.edit.options.distinct;

  if (distinct) {
    // Make an XHR request to fetch distinct values for the field.
    mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'distinct_values',
        dbs: entry.location.layer.dbs,
        locale: entry.location.layer.mapview.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.layer.tableCurrent(),
        field: entry.field
      })).then(response => {
        if (!response) {
          console.warn(`Distinct values query did not return any values for field ${entry.field}`);
          return;
        }

        // Process the response and update the entry's options and value.
        entry.edit.options = [response].flat()
          .map(record => record[entry.field])
          .filter(val => val !== null);

        chk = findMatchingOption(entry);

        entry.value = chk && typeof chk === 'object' && Object.keys(chk)[0] || chk || entry.value || '';

        const entries = entry.edit.options.map(option => ({
          title: typeof option === 'string' && option || Object.keys(option)[0],
          option: typeof option === 'string' && option || Object.values(option)[0]
        }));

        // Create the dropdown element with the updated options.
        return createDropdownElement(entry, entries);
      });
  } else {
    chk = findMatchingOption(entry);
    entry.value = chk && typeof chk === 'object' && Object.keys(chk)[0] || chk || entry.value || '';

    const entries = entry.edit.options.map(option => ({
      title: typeof option === 'string' && option || Object.keys(option)[0],
      option: typeof option === 'string' && option || Object.values(option)[0]
    }));

    // Create the dropdown element.
    return createDropdownElement(entry, entries);
  }
}

// Function to find a matching option in the entry's options.
function findMatchingOption(entry) {
  return entry.edit.options.find(option =>
    typeof option === 'object' && Object.values(option)[0] === entry.value || option === entry.value
  ) || entry.value;
}

// Function to create the actual dropdown element.
function createDropdownElement(entry, entries) {
  return mapp.ui.elements.dropdown({
    placeholder: entry.edit.placeholder,
    span: entry.value,
    entries: entries,
    callback: (e, _entry) => {
      // Update the newValue property in the entry and dispatch a 'valChange' event.
      entry.newValue = _entry.option;
      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry,
        })
      );
    },
  });
}
