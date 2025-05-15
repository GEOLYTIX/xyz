export default function userLocale(params, mapview) {
  params.localeInput = mapp.utils.html.node`<input
    type="text" value="${mapview.locale.name || mapview.locale.key}">`;

  params.ulLocales = mapp.utils.html.node`<ul>`;

  params.panel = mapp.utils.html.node`
    <div 
      class="drawer"
      style="border: 1px solid #333;">${mapp.user.email || 'anonymous'}|${mapview.locale.workspace}
      ${params.ulLocales}
      ${params.localeInput}
      <button class="raised"
        onclick=${saveLocale}>Save</button>     
      <button class="raised" 
        onclick=${removeLocale}>Remove</button>`;

  // Call the listLocales method to render the list of userlocales.
  listLocales(params, mapview);

  // Return the panel as content to be displayed.
  return params.panel;
}

async function removeLocale() {
  params.panel.classList.add('disabled');
  mapview.locale.name = params.localeInput.value;
  await mapp.utils.userLocale.remove(mapview.locale);
  listLocales(params, mapview);
  params.panel.classList.remove('disabled');
}

async function saveLocale(params) {
  params.panel.classList.add('disabled');
  mapview.locale.name = params.localeInput.value;
  const response = await mapp.utils.userLocale.putLocale(mapview);

  if (response === mapview.locale.name) {
    listLocales(params, mapview);
    params.panel.classList.remove('disabled');
  }
}

/**
@function listLocales

@description
The listlocales method requests an array of userlocales keys and names from the userLocale.list utility method and renders a list of links for these userLocale.
*/
async function listLocales(params, mapview) {
  const locales = await mapp.utils.userLocale.list(mapview.locale.workspace);

  const list = locales.map((locale) => {
    const href = `${mapp.host}?locale=${locale.key}&userlocale=${locale.name}`;

    return mapp.utils.html`<li><a href=${href}>${locale.name}`;
  });

  mapp.utils.render(params.ulLocales, mapp.utils.html`<ul>${list}`);
}
