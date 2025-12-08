/**
# /plugins/dark_mode

The module defines a darkTheme object to be applied with the cssColour.setTheme utility.

@requires /ui/utils/cssColour

@module /plugins/dark_mode
*/

/**
@function dark_mode
@description
The dark_mode plugin method adds a button to the mapview controls which allows to toggle the application of a darkTheme defined in this module.

Whether the darkTheme should be applied by default is stored as darkMode flag in the localStorage.
*/
export function dark_mode(plugin, mapview) {
  // If mapbutton doesn't exist, return (for custom views).
  if (!mapview.mapButton) return;

  //For backwards compatibility with localStorage.
  if (localStorage.getItem('darkMode')) {
    localStorage.removeItem('darkMode');
    mapp.user.dark_mode ??= localStorage.getItem('darkMode');
    updateUser();
  }

  // localStorage stores boolean with their respective string values.
  let darkMode = mapp.user.dark_mode;

  // toggle dark_mode if true.
  darkMode &&
    mapp.ui.utils.cssColour.setTheme(mapp.ui.utils.cssColour.themes.dark);

  const button = mapp.utils.html.node`<button
    title=${mapp.dictionary.dark_mode}
    data-id="dark_mode"
    class="btn-color-mode"
    onclick=${() => {
      // toggle darkMode property
      darkMode = !darkMode;

      mapp.user.dark_mode = darkMode;
      updateUser();

      // Update the dark mode theme depending on the user setting
      const ThemeChosen = mapp.user.dark_mode
        ? mapp.ui.utils.cssColour.themes.dark
        : {};

      // Set the dark mode theme
      mapp.ui.utils.cssColour.setTheme(ThemeChosen);

      // change mode icon
      const modeIcon = button.querySelector('span');
      modeIcon.textContent = darkMode ? 'light_mode' : 'dark_mode';
    }}>
    <span class="notranslate material-symbols-outlined">${darkMode ? 'light_mode' : 'dark_mode'}`;

  // If the button container exists, append the dark mode button.
  mapview.mapButton.append(button);
}

/**
@function updateUser
@description
This function updates the user object in the IndexedDB.
Removes roles, admin and, blocked flag from the user to prevent these properties being overwritten.
*/
async function updateUser() {
  // Remove roles, admin and, blocked from mapp.user.
  // Prevents overwriting values from the user table
  delete mapp.user.roles;
  delete mapp.user.admin;
  delete mapp.user.blocked;

  // Store the user object in the IndexedDB
  await mapp.utils.userIndexedDB.put({
    store: 'user',
    name: mapp.user.email,
    obj: mapp.user,
  });
}

/**
@function custom_theme
@description
The custom_theme object from the locale will be applied through the cssColourTheme utility.
@param {Object} theme The colourTheme to be applied.
@example
"custom_theme": {
      "primary": "#311250",
      "base": "#f2f2f2",
      "base-secondary": "#f7f7f7",
      "base-tertiary": "#fafafa",
      "font": "#3f3f3f",
      "font-mid": "#858585",
      "font-contrast": "#dddddd",
      "border": "#dddddd",
      "active": "#c864dc",
      "hover": "#939faa",
      "changed": "#ffffa7",
      "info": "#00695c",
      "danger": "#A21309"
    }
*/
export function custom_theme(theme) {
  mapp.ui.utils.cssColour.setTheme(theme);
}
