export default entry => {

  if (entry.edit) {

    if (!entry.value && !entry.newValue) {

      entry.newValue = mapp.utils.temporal.dateToUnixEpoch();

      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry
        }))
    }

    // return date/time input
    return mapp.utils.html.node`
      <input
        type=${entry.type === 'datetime' ? 'datetime-local' : 'date'}
        value="${mapp.utils.temporal[entry.type](entry)}"
        onchange=${e => {

        entry.newValue = mapp.utils.temporal.dateToUnixEpoch(e.target.value);

        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry
          }))
      }}>`;
  }

  // Assign val for non-editable entry.
  const val = entry.value
    && (entry.type === 'datetime' ? `${mapp.utils.temporal.dateString(entry)} ${mapp.utils.temporal.timeString(entry)}` : mapp.utils.temporal.dateString(entry))
    || 'null'

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${val}`

  return node
}