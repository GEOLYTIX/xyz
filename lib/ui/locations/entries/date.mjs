export default entry => {

  let val;

  let d = new Date(entry.value * 1000)
  .toLocaleDateString(entry.locale, entry.options); // day only as configured in workspace

  let t = new Date(entry.value * 1000)
  .toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); // time only as 00:00

  if (entry.edit) {

    // these formats are only needed to pass values formatted for the input element
    const formats = {
      datetime: `${new Date(entry.value * 1000).toLocaleDateString("fr-CA")}T${t}`, // YYYY-MM-DDT00:00
      date: `${new Date(entry.value * 1000).toLocaleDateString("fr-CA")}` // YYYY-MM-DD
    }

    val = mapp.utils.html.node`
      <input
        type=${entry.type === 'datetime' ? 'datetime-local' : 'date'}
        value="${formats[entry.type]}"
        onchange=${e => {

          // this gets user timezone
          //let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          let unix = new Date(e.target.value).getTime() / 1000;

          entry.newValue = unix;

          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )

        }}>`;
        
  } 
  else {

    val = entry.value && entry.type === 'datetime' ? `${d} ${t}` : `${d}`;
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${val}`

  return node
}