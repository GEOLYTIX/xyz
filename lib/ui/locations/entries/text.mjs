export default entry => {

  // Short circuit if not editable without a value.
  if (!entry.edit && !entry.value) return;

  // Return inputs for editing.
  if (entry.edit) return edit(entry)

  // Return value as text, including prefix and suffix.
  return mapp.utils.html.node`
    <div
      class="val"
      style=${entry.css_val}>
      ${entry.prefix}${entry.value}${entry.suffix}`
}

// Edit function
function edit(entry) {

  // If edit options are defined.
  if (entry.edit.options) {

    // Create container with loading text.
    entry.container = mapp.utils.html.node`<div>Loading...`;

    // If options is an array and contains values, we can create a dropdown.
    if (entry.edit.options.length) {

      // Create dropdown from options.
      options(entry)

    } 
    // If options is empty array, we need to query the table to populate it.
    else {

      // Query distinct field values from the layer table.
      mapp.utils.xhr(
        `${entry.location.layer.mapview.host}/api/query?` +
        mapp.utils.paramString({
          template: 'distinct_values',
          dbs: entry.location.layer.dbs,
          locale: entry.location.layer.mapview.locale.key,
          layer: entry.location.layer.key,
          filter: entry.location.layer.filter?.current,
          table: entry.location.layer.tableCurrent(),
          field: entry.field
        })).then(response => {

          // Return first value from object row as options array.
          entry.edit.options = [response].flat().map(row => {
            return Object.values(row)[0]
          })//.filter(val => val !== null)
          
          // Create dropdown from options.
          options(entry)
        })
    }

    // Return container.
    return entry.container
  }

  // Return text input if no options are defined (free text input).
  return mapp.utils.html.node`
    <input
      type="text"
      maxlength=${entry.edit.maxlength}
      value="${entry.value || ''}"
      placeholder="${entry.edit.placeholder || ''}"
      onkeyup=${e => {
      entry.newValue = e.target.value
      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', { detail: entry }))
    }}>`
}

// Options function
function options(entry) {

  // Create array of objects for optionEntries.
  const optionEntries = entry.edit.options.map(option => ({

    // Assign null if option is null.
    title: option === null ? null : 

      // Assign string as title.
      typeof option === 'string' && option
      
      // Assign first key as title.
      || Object.keys(option)[0],

    // Assign null if option is null.
    option: option === null ? null : 
    
      // Assign string as option.
      typeof option === 'string' && option
      
      // Assign first value as option.
      || Object.values(option)[0]
  }))

  // Find title for the entry.value
  const option = optionEntries.find(e => e.option === entry.value)

  // Render dropdown.
  mapp.utils.render(entry.container, mapp.ui.elements.dropdown({
    placeholder: entry.edit.placeholder,
    span: option?.title || entry.value,
    // Set entries to optionEntries provided.
    entries: optionEntries,
    callback: (e, _entry) => {

      // Assign entry option as newValue.
      entry.newValue = _entry.option

      // Check whether newValue is different from current value.
      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry,
        })
      );
    }
  }))

}