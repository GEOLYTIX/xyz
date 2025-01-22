/**
### lib.ui.utils.userSettings
The function exports the available user settings for the application.
These settings are used to configure the user settings plugin.

@module /ui/utils/userSettings
*/


export default {
  userLanguage,
  userLocale
}

/**
 * @function userLanguage
 *  
 * Provides a dropdown for the user to select a language, and a save button to save the language change. 
 * @param {Object} params - The params configuration object.
 * @returns {HTMLElement} The user language dropdown, and save button in a div.
 * 
 */

function userLanguage(params) {

    // Set the user language description to the default dictionary value if not set.
    params.user_language_desc ??= mapp.dictionary.user_language_desc

    // List of languages key values.
    const languagesList = [
      {
        title: 'English',
        option: 'en',
      },
      {
        title: 'German',
        option: 'de',
      },
      {
        title: 'Chinese',
        option: 'zh',
      },
      {
        title: 'Chinese (Traditional)',
        option: 'zh_tw',
      },
      {
        title: 'Polish',
        option: 'pl',
      },
      {
        title: 'Japanese',
        option: 'ja',
      },
      {
        title: 'Spanish',
        option: 'esp',
      },
      {
        title: 'French',
        option: 'fr',
      },
      {
        title: 'Turkish',
        option: 'tr',
      },
      {
        title: 'Italian',
        option: 'it',
      },
      {
        title: 'Thai',
        option: 'th',
      },
    ];
  
    // Create a dropdown for the user to select a language.
    const languageDropdown = mapp.utils.html`
    ${mapp.ui.elements.dropdown({
      // Set the placeholder to the current language
      placeholder:
        languagesList.find((language) => language.option === mapp.user.language)
          ?.title || mapp.dictionary.user_language_desc,
      entries: languagesList,
      callback: (e, language) => {
        mapp.user.language = language.option;
      },
    })}`;
  
    // Create a save button to store the language change. 
    const languageSave = mapp.utils.html`
    <button class="raised primary-colour bold"
    onclick=${(e) => {
      mapp.utils.xhr(
        `${mapp.host}/api/user/update?email=${mapp.user.email}&field=language&value=${plugin.language}`,
      );

      // We need to get the user again / reload the mapview here to update the language on the UI.

      // Close the dialog
      e.target.closest('dialog').close();
    }}
    >${mapp.dictionary.save}</button>`;
  
    // Return the language dropdown and save button in a div.
    return mapp.utils.html`
    <h3>${params.user_language_desc}</h3>
    <div style="display:flex;"> 
          ${languageDropdown}
            ${languageSave}
    </div>`

}

/**
 * @function userLocale
 *  
 * Provides a save and delete button for the user to save or delete the locale layout.
 * @param {Object} params - The params configuration object.
 * @returns {HTMLElement} The save and delete buttons in a div.
 * 
 */

function userLocale(params) {

    // Set the user settings description to the default dictionary value if not set.
    params.user_settings_desc ??= mapp.dictionary.user_settings_desc

    const userLocaleButtons = 
    mapp.utils.html`
    <h3>${plugin.userLocaleText}</h3>
<div style="display:flex;">        
  
  <button class="raised primary-colour bold"
      onclick=${(e) => {
        mapp.utils.userLocale.save(mapview);
        // Close the dialog
        e.target.closest('dialog').close();
      }}
      >${mapp.dictionary.save}</button>
  <button class="raised primary-colour bold"
      onclick=${(e) => {
        mapp.utils.userLocale.remove(mapview.locale);
        // Close the dialog
        e.target.closest('dialog').close();
      }}
      >${mapp.dictionary.delete}</button>
</div>`;
  
    // Return the save and delete buttons in a div.
    return mapp.utils.html`
    <h3>${params.user_settings_desc}</h3>
    <div style="display:flex;"> 
          ${userLocaleButtons}
    </div>`

}