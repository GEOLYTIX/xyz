export default entry => {

  let val = !isNaN(entry.value) && entry.type === 'integer' ?
    parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
    parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 })

  if (entry.edit) {

    if (entry.edit.range) {

      val = mapp.ui.elements.slider({
        min: entry.edit.range.min,
        max: entry.edit.range.max,
        val: entry.value,
        callback: e => {
          val.value = parseFloat(e.target.value)
          entry.newValue = val.value
          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )
        }
      })

    } else {

      val = mapp.utils.html.node`
      <input
        type="number"
        value="${entry.value || ''}"
        placeholder="${entry.edit.placeholder || ''}"
        onkeyup=${e => {

          // Prevent a float value being sent to an integer field.
          if (entry.type === 'integer') {
            e.target.value = parseInt(e.target.value)
          }

          entry.newValue = e.target.value
          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )
        }}>`
    }
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${entry.prefix}${val}${entry.suffix}`

  return node
}