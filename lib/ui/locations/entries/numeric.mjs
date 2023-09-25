export default entry => {

  if (entry.edit) {

    if (entry.edit.range) {

      return mapp.ui.elements.slider({
        min: entry.edit.range.min,
        max: entry.edit.range.max,
        val: entry.value,
        callback: e => {

          entry.newValue = entry.type === 'integer' ?
            parseInt(e.target.value) :
            parseFloat(e.target.value);

          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )
        }
      })

    } else {

      return mapp.utils.html.node`
      <input
        type="number"
        value=${entry.value}
        placeholder=${entry.edit.placeholder}
        onkeyup=${e => {

          // Prevent a float value being sent to an integer field.
          if (entry.type === 'integer') {
            e.target.value = parseInt(e.target.value);
          }

          entry.newValue = e.target.value
          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            }))

        }}>`
    }
  }

  return mapp.utils.html.node`
    <div
      class="val"
      style=${entry.css_val}>
      ${entry.prefix}${entry.value}${entry.suffix}`
}