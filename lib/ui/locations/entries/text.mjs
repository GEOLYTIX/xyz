export default entry => {

  // Short circuit if not editable without a value.
  if (!entry.edit && !entry.value) return;

  // Return inputs for editing.
  if (entry.edit) return edit(entry)

  return mapp.utils.html.node`
    <div
      class="val"
      style=${entry.css_val}>
      ${entry.prefix}${entry.value}${entry.suffix}`
}

function edit(entry) {

  if (entry.edit.options) {

    entry.container = mapp.utils.html.node`<div>Loading...`;

    if (entry.edit.options.length) {

      // Create dropdown from options.
      options(entry)

    } else {

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
          }).filter(val => val !== null)

          options(entry)
        })
    }

    return entry.container
  }

  // Return text input.
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

function options(entry) {

  // Create array of objects for optionEntries.
  const optionEntries = entry.edit.options.map(option => ({

    // Assign string or key as title.
    title: typeof option === 'string' && option || Object.keys(option)[0],

    // Assign string or value as option.
    option: typeof option === 'string' && option || Object.values(option)[0]
  }))

  // Find title for the entry.value
  const option = optionEntries.find(e => e.option === entry.value)

  mapp.utils.render(entry.container, mapp.ui.elements.dropdown({
    placeholder: entry.edit.placeholder,
    span: option.title || entry.value,
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