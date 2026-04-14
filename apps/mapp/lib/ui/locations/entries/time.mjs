/**
## /ui/locations/entries/time

The module exports the default time entry method.

@module /ui/locations/entries/time
*/

/**
@function time

@description
The entry method returns a formated numeric value. 10.43 > "10:43".

If editable an input type:time will be returned. The onchange event method of the input will parse a float value from the time string and dispatch the valChange event on the location view.

@param {infoj-entry} entry type:geometry entry.
@property {Object} entry.value A numeric time value.
@property {Object} [entry.edit] configuration object for editing the value.

@return {HTMLElement} elements for the location view.
*/
export default function time(entry) {
  let val;

  let stringVal = entry.value?.toString().replace('.', ':');

  stringVal =
    (stringVal && stringVal.length < 3 && `${stringVal}:00`) || stringVal;

  if (entry.edit) {
    val = mapp.utils.html.node`
      <input
        type="time"
        value=${stringVal}
        onchange=${(e) => {
          entry.newValue = parseFloat(e.target.value.replace(':', '.'));

          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry,
            }),
          );
        }}>`;
  } else {
    val = stringVal;
  }

  entry.css_val ??= '';

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${entry.css_val}">
      ${val}`;

  return node;
}
