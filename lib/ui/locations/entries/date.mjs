export default entry => {

  const dateString = new Date(entry.newValue || entry.value * 1000)
    .toLocaleDateString(entry.locale, entry.options); // day only as configured in workspace

  const timeString = new Date(entry.newValue || entry.value * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // time only as 00:00

  if (entry.edit) {

    // formatted value for input element.
    const formats = {
      datetime: `${new Date(entry.newValue || entry.value * 1000).toLocaleDateString("fr-CA")}T${timeString}`, // YYYY-MM-DDT00:00
      date: `${new Date(entry.newValue || entry.value * 1000).toLocaleDateString("fr-CA")}` // YYYY-MM-DD
    }

    // return date/time input
    return mapp.utils.html.node`
      <input
        type=${entry.type === 'datetime' ? 'datetime-local' : 'date'}
        value="${formats[entry.type]}"
        onchange=${e => {

        entry.newValue = new Date(e.target.value).getTime() / 1000;

        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry
          }))
      }}>`;

  }

  // Assign val for non-editable entry.
  const val = entry.value
    && (entry.type === 'datetime' ? `${dateString} ${timeString}` : dateString)
    || 'null'

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${val}`

  return node
}