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
      modeIcon.textContent = darkMode ? 'light_mode' : 'dark_mode';
    }}>
    <span class="material-symbols-outlined">${darkMode ? 'light_mode' : 'dark_mode'}`);
}

/**
Function to set the local storage to if the user uses darkmode or not.
@function toggleDarkMode
*/

function toggleDarkMode(darkMode) {
  const root = document.querySelector(':root');

  const palettes = {
    default: {
      base: '#f2f2f2',
      'base-secondary': '#f2f2f2',
      'base-tertiary': '#ffffff',
      'base-border': '#cccccc',
      text: '#3f3f3f',
      'text-secondary': '#939faa',
      accent: '#003d57',
      'accent-active': '#d57120',
      'accent-hover': '#939faa',
      info: '#0b6f50',
      blocked: '#a21309',
      changed: '#ffffa7',
    },
    dark: {
      base: '#222222',
      'base-secondary': '#333333',
      'base-tertiary': '#555555',
      'base-border': '#333333',
      text: '#f2f2f2',
      'text-secondary': '#d8d8d8',
      accent: '#ffffff',
      'accent-active': '#e18335',
      blocked: '#ef5350',
    },
  };

  if (darkMode) {
    const palette = { ...palettes.default, ...palettes.dark };
    Object.entries(palette).map((entry) => {
      root.style.setProperty(`--color-${entry[0]}`, `${entry[1]}`);
    });
  } else {
    Object.entries(palettes.default).map((entry) => {
      root.style.setProperty(`--color-${entry[0]}`, `${entry[1]}`);
    });
  }
}
