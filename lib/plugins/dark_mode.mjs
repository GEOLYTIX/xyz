/**
# /plugins/dark_mode

The module defines a darkTheme object to be applied with the cssColourTheme utility.

@requires /ui/utils/cssColourTheme

@module /plugins/dark_mode
*/

const darkTheme = {
  base: '#222222',
  'base-secondary': '#555555',
  'base-tertiary': '#444444',
  'base-contrast': '#333333',
  'base-border': '#666666',
  text: '#f2f2f2',
  'text-secondary': '#CCCCCC',
  'text-tertiary': '#ffffff',
  accent: '#DAD095',
  'accent-active': '#e18335',
  blocked: '#ef5350',
  changed: '#666600',
};

/**
@function dark_mode
@description
The dark_mode plugin method adds a button to the mapview controls which allows to toggle the application of a darkTheme defined in this module.

Whether the darkTheme should be applied by default is stored as darkMode flag in the localStorage.
*/
export function dark_mode() {
  // Get the map button
  const mapButton = document.getElementById('mapButton');

  // If mapbutton doesn't exist, return (for custom views).
  if (!mapButton) return;

  // localStorage stores boolean with their respective string values.
  let darkMode = localStorage.getItem('darkMode') === 'true';

  // toggle dark_mode if true.
  darkMode && toggleDarkMode(darkTheme);

  // If the button container exists, append the dark mode button.
  mapButton.append(mapp.utils.html.node`<button
    title=${mapp.dictionary.dark_mode}
    class="btn-color-mode"
    onclick=${() => {
      // toggle darkMode property
      darkMode = !darkMode;

      localStorage.setItem('darkMode', darkMode);

      mapp.ui.utils.cssColourTheme(darkMode ? darkTheme : {});

      // change mode icon
      const modeIcon = mapButton.querySelector('.btn-color-mode span');
      modeIcon.textContent = darkMode ? 'light_mode' : 'dark_mode';
    }}>
    <span class="material-symbols-outlined">${darkMode ? 'light_mode' : 'dark_mode'}`);
}
