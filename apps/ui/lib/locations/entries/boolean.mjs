/**
The boolean [location] entries module exports the boolean function as default.

@module /ui/locations/entries/boolean
*/

/**
@function boolean

@description
## mapp.ui.locations.entries.boolean(entry)
Returns a HTML element as visual representation of the boolean value. A checkbox element will be returned if the entry is editable.

```js
{
  "title": "Flag",
  "label": "Checkbox",
  "edit": true,
  "field": "flag",
  "type": "boolean",
  "inline": true
}
```

@param {infoj-entry} entry type:boolean infoj entry.

@returns {HTMLElement} Location view entry node.
*/
export default function boolean(entry) {
  if (entry.edit) {
    return mapp.ui.elements.chkbox({
      checked: entry.newValue !== undefined ? entry.newValue : entry.value,
      disabled: !entry.edit,
      label: entry.label || entry.title,
      onchange: (checked) => {
        entry.newValue = checked;
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry,
          }),
        );
      },
    });
  }

  entry.label ??= '';

  const iconName = entry.value ? 'check' : 'close';

  return mapp.utils.html.node`
    <div class="link-with-img">
      <div class="notranslate material-symbols-outlined">${iconName}</div>
      <span>${entry.label}`;
}
