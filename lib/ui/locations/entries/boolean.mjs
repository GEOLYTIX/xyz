/**
mapp.ui.locations.entries.boolean(entry)

Exports the boolean entry method.

@module boolean
*/

/**
@function boolean

@description
Returns a HTML element, the value of which is a boolean and will display either a tick or a cross.

@example
```json
{
  "title": "Flag",
  "field": "flag",
  "type": "boolean",
  "inline": true
}
``` 

@param {Object} entry
@param {string} [entry.title] The entry title.
@param {Object} entry.field The entry field.
@param {boolean} [entry.inline] Whether the entry should be displayed inline.
*/
export default function boolean(entry) {

  if (entry.edit) {

    return mapp.ui.elements.chkbox({
      label: entry.label || entry.title,
      checked: entry.newValue !== undefined ? entry.newValue : entry.value,
      disabled: !entry.edit,
      onchange: (checked) => {

        entry.newValue = checked
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry
          }))

      }
    })

  }

  const icon = `mask-icon ${entry.value ? 'done' : 'close'}`

  return mapp.utils.html.node`
  <div class="link-with-img">
    <div class=${icon}></div>
    <span>`
}