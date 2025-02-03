/**
### /plugins/userLocale

The userLocale plugin provides a test interface for the userLocale.

@module /plugins/userLocale
*/

/**
@function userLocale

Buttons to save/overwrite or delete the current userLocale are added to the layers element in the default view.

@param {Object} plugin The userLocale config from the locale.
@param {Object} mapview The mapview object.
*/
export function userLocale(plugin, mapview) {
  const layersNode = document.getElementById('layers');

  if (!layersNode) return;

  plugin.panel = mapp.utils.html.node`
    <div 
      class="drawer"
      style="border: 1px solid #333;">User Locale:
      <input
        type="text"
        value="${mapview.locale.key}"
        onchange=${onChange}>
      <button class="raised"
        onclick=${(e) => mapp.utils.userLocale.save(mapview)}
        >Save</button>
      <button class="raised"
        onclick=${(e) => mapp.utils.userLocale.remove(mapview.locale)}
        >Delete</button>`;

  // Append the plugin btn to the btnColumn.
  layersNode.append(plugin.panel);

  function onChange(e) {
    console.log(e);
  }
}
