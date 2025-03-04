/**
# /plugins/dark_mode

@module /plugins/dark_mode
*/

/**
@function dark_mode
*/
export function dark_mode() {
  // Get the map button
  const mapButton = document.getElementById('mapButton');

  // If mapbutton doesn't exist, return (for custom views).
  if (!mapButton) return;

  // localStorage stores boolean with their respective string values.
  let darkMode = localStorage.getItem('darkMode') === 'true';

  // toggle dark_mode if true.
  darkMode && toggleDarkMode(darkMode);

  // If the button container exists, append the dark mode button.
  mapButton.append(mapp.utils.html.node`<button
    title=${mapp.dictionary.dark_mode}
    class="btn-color-mode"
    onclick=${() => {
      // toggle darkMode property
      darkMode = !darkMode;

      localStorage.setItem('darkMode', darkMode);

      toggleDarkMode(darkMode);

      // change mode icon
      const modeIcon = mapButton.querySelector('.btn-color-mode span');
      modeIcon.textContent = darkMode ? 'dark_mode' : 'light_mode';
    }}>
    <span class="material-symbols-outlined">${darkMode ? 'dark_mode' : 'light_mode'}`);
}

/**
Function to set the local storage to if the user uses darkmode or not.
@function toggleDarkMode
*/

function toggleDarkMode(darkMode) {
  const root = document.querySelector(':root');

  if (darkMode) {
    root.style.setProperty('--color-off-black', '#e3e3e3');
    root.style.setProperty('--color-primary', '#ffffff');
    root.style.setProperty('--color-primary-light', '#eeeeee');
    root.style.setProperty('--color-light', '#333333');
    root.style.setProperty('--color-off-light', '#eeeeee');
    root.style.setProperty('--color-light-secondary', '#f2f2f2');
    root.style.setProperty('--color-light-tertiary', '#fafafa');
    root.style.setProperty('--color-mid', '#e3e3e3');
    root.style.setProperty('--color-on', '#d57120');
    root.style.setProperty('--color-no', '#a21309');
    root.style.setProperty('--color-changed', '#ffffa7');
    root.style.setProperty('--color-ok', '#0b6f50');
    root.style.setProperty('--color-input-border', '#ccc');
  } else {
    root.style.setProperty('--color-off-black', '#3f3f3f');
    root.style.setProperty('--color-primary', '#003d57');
    root.style.setProperty('--color-primary-light', '#939faa');
    root.style.setProperty('--color-light', '#ffffff');
    root.style.setProperty('--color-off-light', '#eeeeee');
    root.style.setProperty('--color-light-secondary', '#f2f2f2');
    root.style.setProperty('--color-light-tertiary', '#fafafa');
    root.style.setProperty('--color-mid', '#e3e3e3');
    root.style.setProperty('--color-on', '#d57120');
    root.style.setProperty('--color-no', '#a21309');
    root.style.setProperty('--color-changed', '#ffffa7');
    root.style.setProperty('--color-ok', '#0b6f50');
    root.style.setProperty('--color-input-border', '#ccc');
  }
}
