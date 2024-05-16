export default entry => {

    // Short circuit if not editable without a value.
    if(!entry.value && !entry.edit) return;

    // Return if no key is present
    if(!entry.key){
        console.warn(`type: json_field requires an entry.key`)
        return;
    }

    //Return if the key value is null
    if(!entry.value[entry.key]) return;

    // Return inputs for editing.
    if (entry.edit) return edit(entry)

    //entry.value = entry.value[entry.key]
    
    return mapp.utils.html.node`
    <div
      class="val"
      style=${entry.css_val}>
      ${entry.prefix}${entry.value[entry.key]}${entry.suffix}`
}

// Edit function
function edit(entry) {

    // If edit options are defined.
    if (entry.edit.options) {
  
      // Create container with loading text.
      entry.container = mapp.utils.html.node`<div>${mapp.dictionary.loading}`;
  
      // If options is an array and contains values, we can create a dropdown.
      if (entry.edit.options.length) {
  
        // Create dropdown from options.
        options(entry)
  
      }
      // If options is empty array, we need to query the table to populate it.
      else {
  
        // We can query a particular template or Query distinct field values from the layer table.
        mapp.utils.xhr(
          `${entry.location.layer.mapview.host}/api/query?` +
          mapp.utils.paramString({
            template: entry.edit.query || 'distinct_values_json',
            dbs: entry.location.layer.dbs,
            locale: entry.location.layer.mapview.locale.key,
            layer: entry.location.layer.key,
            filter: entry.location.layer.filter?.current,
            table: entry.location.layer.tableCurrent(),
            key: entry.key,
            field: entry.field,
            id: entry.location.id
          })).then(response => {
  
            // If response is null, we can not create a dropdown, so we return a message.
            if (response === null) {
              entry.container.innerHTML = `${mapp.dictionary.no_options_available}`
              return;
            }
            // Return first value from object row as options array.
            entry.edit.options = [response].flat().map(row => {
              return Object.values(row)[0]
            })
  
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
        value="${entry.newValue || entry.value[entry.key] || ''}"
        placeholder="${entry.edit.placeholder || ''}"
        onkeyup=${e => {
        entry.newValue ??= {}
        entry.newValue[entry.key] = e.target.value
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', { detail: entry }))
      }}>`
  }
