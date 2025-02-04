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

  const localeInput = mapp.utils.html.node`<input
    type="text" value="${mapview.locale.key}">`;

  const ulLocales = mapp.utils.html.node`<ul>`;

  plugin.panel = mapp.utils.html.node`
    <div 
      class="drawer"
      style="border: 1px solid #333;">${mapp.user.email || 'anonymous'}|${mapview.locale.workspace}
      ${ulLocales}
      ${localeInput}
      <button class="raised"
        onclick=${saveLocale}>Save</button>     
      <button class="raised" 
        onclick=${removeLocale}>Remove</button>`;

  // Append the plugin btn to the btnColumn.
  layersNode.append(plugin.panel);

  listLocales();

  async function saveLocale(e) {
    mapview.locale.name = localeInput.value;
    await mapp.utils.userLocale.save(mapview);
    listLocales();
  }

  async function removeLocale(e) {
    mapview.locale.name = localeInput.value;
    await mapp.utils.userLocale.remove(mapview.locale);
    listLocales();
  }

  async function listLocales() {
    const locales = await mapp.utils.userLocale.list(mapview.locale.workspace);

    const list = locales.map((locale) => mapp.utils.html`<li>${locale}`);
    mapp.utils.render(ulLocales, mapp.utils.html`<ul>${list}`);
  }
}
