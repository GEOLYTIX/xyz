/**
### /plugins/userSettings

The userSettings plugin provides a button that creates a modal holding the userLocale saving, and language changing for a user.

@module /plugins/userSettings
@requires /utils/jsonParser
@requires /utils/userIndexedDB
@requires /utils/userLocale
*/

/**
@function userSettings

Provides a button that when clicked opens a modal. 

@param {Object} plugin The userSettings config from the locale.
@param {Object} mapview The mapview object.
*/

export function userSettings(plugin, mapview) {
    const mapButton = document.getElementById('mapButton');
  
    if (!mapButton) return;
  
    plugin ??= {};
  
    plugin.title ??= `${mapp.dictionary.user_settings}`;
  
    plugin.data_id ??= 'user-settings';
  
    plugin.class ??= 'alert-confirm';
  
    plugin.minimizeBtn ??= true;
    plugin.closeBtn ??= true;
  
    plugin.header = mapp.utils.html`
      <h4>${plugin.title}`;
  
    plugin.userLocaleText ??= `${mapp.dictionary.user_locale_desc}`;
    plugin.userLanguageText ??= `${mapp.dictionary.user_language_desc}`;
  
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
    plugin.languageDropdown = mapp.utils.html`${mapp.ui.elements.dropdown({
      // Set the placeholder to the current language
      placeholder:
        languagesList.find((language) => language.option === mapp.user.language)
          ?.title || mapp.dictionary.user_language_desc,
      entries: languagesList,
      callback: (e, language) => {
        plugin.language ??= language.option;
      },
    })}`;
  
    // Create the content of the dialog.
    plugin.content = mapp.utils.html`
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
      </div>
          
      <h3>${plugin.userLanguageText}</h3>
      <div style="display:flex;"> 
  
          ${plugin.languageDropdown}
       <button class="raised primary-colour bold"
          onclick=${(e) => {
            mapp.utils.xhr(
              `${mapp.host}/api/user/update?email=${mapp.user.email}&field=language&value=${plugin.language}`,
            );
  
            // We need to get the user again / reload the mapview here to update the language on the UI.
  
            // Close the dialog
            e.target.closest('dialog').close();
          }}
          >${mapp.dictionary.save}</button>
      </div>
      `;
  
    const btn = mapp.utils.html.node`
    <button
      title=${mapp.dictionary.user_settings}
      onclick=${(e) => {
        e.target.classList.toggle('active');
        mapp.ui.elements.dialog(plugin);
      }}>
      <div class="mask-icon settings">`;
  
    mapButton.append(btn);
  }
  