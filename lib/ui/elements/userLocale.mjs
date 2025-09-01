/**
Exports the default userLocale element method as mapp.ui.elements.userLocale().

@module ui/elements/userLocale
*/

/**
@function userLocale

@description
Returns a panel with an input field to define the userlocale name and buttons to either put (create or overwrite) a stored userlocale or delete a stored userlocale.
The panel will be disabled during the transaction to save or remove a user locale.

@param {Object} params The userLocale config from the locale.
@param {Object} mapview The mapview object.
@returns {HTMLElement} The panel element containing the userLocale interface.
*/

export default function userLocale(params, mapview) {
  params.localeInput = mapp.utils.html.node`<input
    type="text" value="${decodeURIComponent(mapview.locale.name) || mapview.locale.key}">`;

  params.ulLocales = mapp.utils.html.node`<div class="user-locales">`;

  params.panel = mapp.utils.html.node`
  <div>
    <p>${mapp.dictionary.user_locale_specific}</p>
    <p>${mapp.dictionary.user_locale_context}</p>
    <br>
    <h3>${mapp.dictionary.user_locale_save}</h3>

    <div style="display:flex;">${params.localeInput}
      <button style="font-size: 1.5em;"
        onclick=${async () => await saveLocale(params, mapview)}>
        <span class="notranslate material-symbols-outlined">save</span>
      </button>
    </div>
    
  <h3>${mapp.dictionary.user_locale_desc}</h3>
  ${params.ulLocales}`;

  // Call the listLocales method to render the list of userlocales.
  listLocales(params, mapview);

  // Return the panel as content to be displayed.
  return params.panel;
}

/**
@function removeLocale
@description
The removeLocale method removes the userlocale from the mapview and calls the listLocales method to update the list of userlocales.
@param {Object} params The userLocale config from the locale.
@param {Object} mapview The mapview object.
@param {string} locale_name The name of the userlocale to be removed.
*/
async function removeLocale(params, mapview, locale_name) {
  params.panel.classList.add('disabled');
  mapview.locale.name = locale_name;
  await mapp.utils.userLocale.remove(mapview.locale);
  listLocales(params, mapview);
  params.panel.classList.remove('disabled');
}

/**
@function saveLocale
@description
The saveLocale method saves the userlocale to the mapview and calls the listLocales method to update the list of userlocales.
*/
async function saveLocale(params, mapview) {
  params.panel.classList.add('disabled');
  mapview.locale.name = encodeURIComponent(params.localeInput.value);
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
The list includes a delete button for each userLocale, which when clicked will remove the userLocale from the mapview and update the list of userlocales.
*/
async function listLocales(params, mapview) {
  const locales = await mapp.utils.userLocale.list(mapview.locale.workspace);

  const list = locales.map((locale) => {
    const href = `${mapp.host}?locale=${locale.key}&userlocale=${encodeURIComponent(locale.name)}`;

    const removeBtn = mapp.utils.html`<button
       onclick=${async (e) => await removeLocale(params, mapview, locale.name)}>
        <span class="notranslate material-symbols-outlined">delete</span>
      </button>`;

    return mapp.utils
      .html`<li>${removeBtn}<a href=${href}>${decodeURIComponent(locale.name)}`;
  });

  mapp.utils.render(params.ulLocales, mapp.utils.html`<ul>${list}`);
}
