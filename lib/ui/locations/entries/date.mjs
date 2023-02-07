export default entry => {

  let val

  if (entry.edit) {

    val = mapp.utils.html.node`
      <input
        type=${entry.type === 'datetime' && 'datetime-local' || 'date'}
        value=${entry.value &&
          (entry.type === 'datetime' && new Date(entry.value * 1000).toISOString().split('Z')[0]
            || new Date(entry.value * 1000).toISOString().split('T')[0])}
        onchange=${e => {

          entry.newValue = new Date(e.target.value).getTime() / 1000

          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )

        }}>`;
        
  } else {

    val = entry.value && new Date(entry.value * 1000).toLocaleString(entry.locale, entry.options)
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${val}`

  return node
}