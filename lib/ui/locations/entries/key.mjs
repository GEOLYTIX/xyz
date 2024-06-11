/**
mapp.ui.locations.entries.key(entry)

The method returns the name of the `entry.location.layer` of the entry.
This returns a styled div element with the name of the layer.
This can be clicked to toggle the visibility of the layer.

@example
```json
{
  "type":"key"
}
``` 
@function key
@param {Object} entry
@param {string} entry.type The type of the entry.
@return {HTMLElement} The button key element, with an onclick event to toggle the visibility of the layer.
*/

export default function key(entry) {
  const node = mapp.utils.html.node`
    <div class="layer-key">
      <button 
        onclick="${() => {
      // Set the display of the layer to the opposite of its current value
      entry.location.layer.display = !entry.location.layer.display;
      // Update the layer toggle
      entry.location.layer.displayToggle.classList.toggle('on');
      // Reload the layer
      entry.location.layer.reload();
    }}">
        ${entry.location.layer.name}
      </button>
    </div>
        `;

  return node;
}
