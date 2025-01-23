/**
 
# Dark Mode

* ### 📝 Reviewed by
* - [@dbauszus-glx](https://github.com/dbauszus-glx) (01/02/2024)

* ### Description
* This allows the configuration developer to add a plugin that will allow the user to toggle between dark and light mode.
* The users choice is stored in the `localStorage` object and is persistent across sessions.
* 
* ### How to use 📌

* Add the plugin to the `workspace.plugins` array.
```json 
"plugins":[
    "${PLUGINS}/dark_mode.js"
]

```
* Add the plugin to the `workspace.locale` or each locale object individually in the `workspace.locales` object.
```json
"dark_mode":{}
```
* 
* @module dark_mode
* @author @eo-uk
*/

/*console.log(`dark_mode v4.8`)


html.dark-mode .tabview .panel {
  background-color: var(--dm-dark-neutral);
}

html.dark-mode .tabview .tabs,
html.dark-mode .tabview .tabulator-tableholder {
  background: var(--dm-darker);
}

html.dark-mode .tabview .tab .header {
  color: var(--dm-light);
  background-color: var(--dm-dark-faded);
}

html.dark-mode .tabview .tab.active .header {
  background-color: var(--dm-accent);
}

html.dark-mode .tabview .panel .btn-row {
  background-color: var(--dm-dark-neutral);
}

html.dark-mode .tabview .panel .btn-row button {
  font-weight: bold;
  color: var(--dm-accent);
  background: var(--dm-dark-faded);
}

html.dark-mode .tabview .tabulator-header {
  background: var(--dm-dark);
}

html.dark-mode .tabview .tabulator-col {
  background-color: var(--dm-dark-faded);
  color: var(--dm-light);
}

html.dark-mode .tabview .tabulator-row {
  color: var(--dm-light);
}

html.dark-mode .tabview .tabulator-row.tabulator-row-odd {
  background-color: var(--dm-dark-neutral);
}

html.dark-mode .tabview .tabulator-row.tabulator-row-even {
  background-color: var(--dm-medium);
}

html.dark-mode .tabview>.panel>.flex-col {
  background-color: var(--dm-dark-faded);
}

html.dark-mode .tabulator .tabulator-footer {
  background: var(--dm-dark);
}

html.dark-mode .tabulator .tabulator-footer .tabulator-page {
  color: var(--dm-light);
}

html.dark-mode .tabulator .tabulator-footer .tabulator-page.active {
  color: var(--dm-accent);
}

`)*/

// Add dictionary definitions
/*mapp.utils.merge(mapp.dictionaries, {
  en: {
    dark_mode: 'Color Mode'
  },
  pl: {
    dark_mode: 'Tryb Koloru'
  }
});*/

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
