/**
### /plugins/userLocale

The userLocale plugin provides a test interface for the userLocale.

@module /plugins/userLocale
*/

/**
@function userLocale

The test interface for the user locale provides a list of the userlocale stored for user|workspace.

An input allows to define the userlocale name with buttons to either put (create or overwrite) a stored userlocale or delete a stored userlocale.

The panel will be disabled during the transaction to save or remove a user locale.

@param {Object} plugin The userLocale config from the locale.
@param {Object} mapview The mapview object.
*/
export function userLocale(plugin, mapview) {
  const layersNode = document.getElementById('layers');

  if (!layersNode) return;

  plugin.localeInput = mapp.utils.html.node`<input
    type="text" value="${mapview.locale.name || mapview.locale.key}">`;

  plugin.ulLocales = mapp.utils.html.node`<ul>`;

  plugin.panel = mapp.utils.html.node`
    <div 
      class="drawer"
      style="border: 1px solid #333;">${mapp.user.email || 'anonymous'}|${mapview.locale.workspace}
      ${plugin.ulLocales}
      ${plugin.localeInput}
      <button class="raised"
        onclick=${saveLocale}>Save</button>     
      <button class="raised" 
        onclick=${removeLocale}>Remove</button>`;

  // Append the plugin btn to the btnColumn.
  layersNode.append(plugin.panel);

  listLocales(plugin, mapview);

  async function saveLocale() {
    plugin.panel.classList.add('disabled');
    mapview.locale.name = plugin.localeInput.value;
    const response = await mapp.utils.userLocale.put(mapview);

    if (response === mapview.locale.name) {
      listLocales(plugin, mapview);
      plugin.panel.classList.remove('disabled');
    }
  }

  async function removeLocale() {
    plugin.panel.classList.add('disabled');
    mapview.locale.name = plugin.localeInput.value;
    await mapp.utils.userLocale.remove(mapview.locale);
    listLocales(plugin, mapview);
    plugin.panel.classList.remove('disabled');
  }
}

/**
@function listLocales

@description
The listlocales method requests an array of userlocales keys and names from the userLocale.list utility method and renders a list of links for these userLocale.
*/
async function listLocales(plugin, mapview) {
  const locales = await mapp.utils.userLocale.list(mapview.locale.workspace);

  const list = locales.map((locale) => {
    const href = `${mapp.host}?locale=${locale.key}&userlocale=${locale.name}`;

    return mapp.utils.html`<li><a href=${href}>${locale.name}`;
  });

  mapp.utils.render(plugin.ulLocales, mapp.utils.html`<ul>${list}`);
}
