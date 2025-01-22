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
*/

export function userSettings(plugin) {
  plugin ??= {};

  // if no settings object, return.
  if (!plugin.settings) {
    console.warn(
      `UserSettings: you must provide a settings object, available options are: ${Object.keys(mapp.ui.utils.userSettings)}`,
    );
    return;
  }

  const mapButton = document.getElementById('mapButton');

  if (!mapButton) return;

  plugin.title ??= `${mapp.dictionary.user_settings}`;

  plugin.data_id ??= 'user-settings';

  plugin.class ??= 'alert-confirm';

  plugin.minimizeBtn ??= true;
  plugin.closeBtn ??= true;

  plugin.header = mapp.utils.html`
      <h4>${plugin.title}`;

  // Create the content array for the userSettings modal.
  plugin.content = [];

  // Provide the userSettings options based on the plugin configuration.
  plugin.settings.map((setting) => {
    plugin.content.push(mapp.ui.utils.userSettings[setting](plugin));
  });

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
