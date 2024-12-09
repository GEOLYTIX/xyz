/**
## /ui/locations/entries/date

The date entry module exports a default date method to process infoj entries with an unix datetime integer value.

@requires /utils/temporal

@module /ui/locations/entries/date
*/

export default date

/**
@function date

@description
The date entry method returns a formatted date[time] string or an input element to edit date[time] entry values.

Date[time] values returned from the input element will be stored as UnixEpoch integer values.

@param {infoj-entry} entry type:date or type:datetime entry.
@property {integer} entry.value date[time] as unix epoch.
@property {integer} [entry.newValue] updated entry.value which has not yet been saved.
@property {Object} [entry.edit] the entry value is editable.

@return {HTMLElement} Formatted datestring or date input if editable.
*/
function date(entry) {

  if (entry.edit) {

    if (!entry.value && !entry.newValue) {

      entry.newValue = mapp.utils.temporal.dateToUnixEpoch();

      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry
        }))
    }

    // return date/time input
    return mapp.utils.html.node`<input
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
  const val = entry.value ? mapp.utils.temporal.dateString(entry) : 'null'

  entry.css_val ??= ''

  const node = mapp.utils.html.node`<div
    class="val"
    style=${entry.css_val}>
    ${val}`

  return node
}
