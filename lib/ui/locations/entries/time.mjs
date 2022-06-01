export default entry => {

  let val

  if (entry.edit) {

    val = mapp.utils.html.node`
      <input
        type="time"
        value="00:00"
        onchange=${e => {

          entry.newValue = parseFloat(e.target.value.replace(':','.'))

          console.log(entry.newValue.toString().replace('.',':'))

          // entry.location.view?.dispatchEvent(
          //   new CustomEvent('valChange', {
          //     detail: entry
          //   })
          // )

        }}>`;
        
  } else {

    val = "00:00"
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${val}`

  return node
}