export default entry => {
  // val maybe the input element with the entry.value.
  let val = entry.value;

  if (entry.edit) {

    if (entry.edit.options) {

      // If distinct get the values from the field on the table.
      if (entry.edit.distinct) {

        // Create container element which contains the current value or loading text.
        const containerEl = mapp.utils.html.node`<div class="val-container">${entry.value || 'Loading...'}</div>`;

        // start async API call to load options
        handleDistinctOptions(entry, containerEl);

        val = containerEl;

      } else {

        val = options(entry);
      }

    } else {

      val = mapp.utils.html`
        <input
          type="text"
          maxlength=${entry.edit.maxlength}
          value="${entry.value || ''}"
          placeholder="${entry.edit.placeholder || ''}"
          onkeyup=${e => {
          entry.newValue = e.target.value
          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )
        }}
        >
      `
    }
  }

  return mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}"
    >
      ${entry.prefix}${val}${entry.suffix}
    </div>  
  `
}

function options(entry) {
  const chk = entry.edit.options.find(
    option => typeof option === 'object' && Object.values(option)[0] === entry.value || option === entry.value
  ) || entry.value

  entry.value = chk
    && typeof chk === 'object'
    && Object.keys(chk)[0] || chk || entry.value || '';

  const entries = entry.edit.options.map(option => ({
    title: typeof option === 'string' && option || Object.keys(option)[0],
    option: typeof option === 'string' && option || Object.values(option)[0]
  }))

  const dropdown = mapp.ui.elements.dropdown({
    placeholder: entry.edit.placeholder,
    span: entry.value,
    entries: entries,
    callback: (e, _entry) => {
      entry.newValue = _entry.option
      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry,
        })
      );
    },
  });

  return dropdown
}

async function handleDistinctOptions(entry, containerEl) {

  // if entry.edit.options is an empty array, set it to the response 
  // We don't want to make the API call if we already have the options.

  if (!entry.edit.options.length) {
    // Query distinct field values from the layer table.
    const response = await mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'distinct_values',
        dbs: entry.location.layer.dbs,
        locale: entry.location.layer.mapview.locale.key,
        layer: entry.location.layer.key,
        filter: entry.location.layer.filter?.current,
        table: entry.location.layer.tableCurrent(),
        field: entry.field
      })
    )

    if (!response) {
      console.warn(`Distinct values query did not return any values for field ${entry.field}`)
      return;
    }
    entry.edit.options = response
      // Flatten response in array to account for the response being a single record and not an array.
      .flat()

      // Map the entry field from response records.
      .map(record => record[entry.field])

      // Filter out null values.
      .filter(val => val !== null)

  }
    const contentsEl = options(entry);

    containerEl.replaceChildren(contentsEl);
  
}