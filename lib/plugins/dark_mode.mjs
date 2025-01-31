/**
# /plugins/dark_mode

The dark_mode plugin exports a method to add a toggle to the mapview button control.

The toggle will flip the application view colour scheme. The toggle state is stored in localStorage.

Add the plugin to the `workspace.locale` or each locale object individually in the `workspace.locales` object.

```json
"dark_mode":{}
```

@module /plugins/dark_mode
@author @eo-uk
Adapted by @cityremade on 23/01/2025
*/

export function dark_mode(plugin, mapview) {
  // If called from syncPlugins dark_mode may not be defined in the locale.
  plugin ??= mapview.locale.dark_mode || {};

  // Get the map button
  const mapButton = document.getElementById('mapButton');

  // If mapbutton doesn't exist, return (for custom views).
  if (!mapButton) return;

  // localStorage stores boolean with their respective string values.
  plugin.darkMode ??= localStorage.getItem('darkMode') === 'true';

  // toggle dark_mode if true.
  plugin.darkMode && toggleDarkMode();

  // If the button container exists, append the dark mode button.
  mapButton.append(mapp.utils.html.node`<button
    title=${mapp.dictionary.dark_mode}
    class="btn-color-mode"
    onclick=${() => {
      toggleDarkMode();

      // change mode icon
      const modeIcon = mapButton.querySelector('.btn-color-mode span');
      modeIcon.textContent =
        localStorage.getItem('darkMode') === 'true'
          ? 'light_mode'
          : 'dark_mode';
    }}>
    <span class="material-symbols-outlined">${plugin.darkMode ? 'light_mode' : 'dark_mode'}`);
}

/**
Function to set the local storage to if the user uses darkmode or not.
@function toggleDarkMode
*/

function toggleDarkMode() {
  const htmlEl = document.querySelector('html');
  htmlEl.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', `${htmlEl.classList.contains('dark-mode')}`);
}
