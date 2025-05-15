export default function userLocale(params, mapview) {
  params.localeInput = mapp.utils.html.node`<input
    type="text" value="${mapview.locale.name || mapview.locale.key}">`;

  params.ulLocales = mapp.utils.html.node`<div>`;

  params.panel = mapp.utils.html.node`
  <div>
    <p>${mapp.dictionary.user_locale_specific}</p>
    <p>${mapp.dictionary.user_locale_context}</p>
    <br>
    <h3>${mapp.dictionary.user_locale_save}</h3>

    <div style="display:flex;">${params.localeInput}
      <button style="font-size: 1.5em;"
        onclick=${async () => await saveLocale(params, mapview)}>
        <span class="material-symbols-outlined">save</span>
      </button>
    </div>
    
  <h3>${mapp.dictionary.user_locale_projects}</h3>
  ${params.ulLocales}`;

  // Call the listLocales method to render the list of userlocales.
  listLocales(params, mapview);

  // Return the panel as content to be displayed.
  return params.panel;
}

async function removeLocale(params, mapview) {
  params.panel.classList.add('disabled');
  mapview.locale.name = params.localeInput.value;
  await mapp.utils.userLocale.remove(mapview.locale);
  listLocales(params, mapview);
  params.panel.classList.remove('disabled');
}

async function saveLocale(params, mapview) {
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

    const removeBtn = mapp.utils.html`<button
       onclick=${async () => await removeLocale(params, mapview)}>
        <span class="material-symbols-outlined">delete</span>
      </button>`;

    return mapp.utils.html`<li>${removeBtn}<a href=${href}>${locale.name}`;
  });

  mapp.utils.render(params.ulLocales, mapp.utils.html`<ul>${list}`);
}
