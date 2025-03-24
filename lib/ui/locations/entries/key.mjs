/**
## ui/locations/entries/key

The key entry module exports a default [location] entry method to process infoj `type:key` entries.

Dictionary entries:
- layer_visibility

@requires /dictionary 

@module /ui/locations/entries/key
*/

/**
@function key

@description
mapp.ui.locations.entries.key(entry)

The entry method returns a button HTML element which will toggle the location.layer display.

The button classList reflects whether the layer is displayed or not.

@example
```json
{
  "type":"key"
}
``` 

@param {Object} entry
@param {Object} entry.location.layer The Mapp location layer object.

@return {HTMLElement}
The button key element, with an onclick event to toggle the visibility of the layer.
*/

export default function key(entry) {
  const classList = `layer-key ${entry.location.layer.display ? 'active' : ''}`;

  const node = mapp.utils.html.node`<div>
    <button 
      class=${classList}
      title="${mapp.dictionary.layer_visibility}"
      onclick="${(e) => {
        if (e.target.classList.toggle('active')) {
          entry.location.layer.show();
        } else {
          entry.location.layer.hide();
        }
      }}">${entry.location.layer.name}`;

  return node;
}
