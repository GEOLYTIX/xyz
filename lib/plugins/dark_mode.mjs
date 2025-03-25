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
@description
Colour palette consists of the following colours:
* Backgrounds *
base - most outer background, color used for document body, control panel.
base-secondary - background colour for first level of containers. Might be the same as outer background for some light palettes.
base-tertiary - background colour for interative elements embedded in the containers of the first level.
base-contrast - colour used as baseline for palette that makes elements stand out. For light palettes this is expected to be white, for dark palettes - their darkest shade. Used as background for editable text etc.
* Border * 
base-border - colour used for borders. Might be the same as any of backgound colours or contrasting for better readability.
* Text *
text - default body text colour. 
text-secondary - less prominent colour for helper text and symbols, ideally neutral colour readable on both darker and lighter backgrounds.
text-tertiary - colour contrasting with default text, used on inverted backgrounds. Example: white text to use in label of accent colour.
* Accents * 
accent - prominent colour for interactive elements - buttons, links, toggles.
accent-active - prominent colour for interactive elements in their activated state.
accent-hover - colour used for highlighting elements on hover.
* Information *
info - prominent colour indicating information, confirmation, valid state. Background neutral green by default.
blocked - prominent colour indicating error, invalid data, irreversible actions. Red by default.
changed - colour used as background on edited fields. Subtle yellow by default, should fit well with text-secondary for readability.

Defined colour variables will override corresponsing defaults.

Palette template using default variables:
```json 
default: {
      // Backgrounds
      base: '#f2f2f2',
      'base-secondary': '#f2f2f2',
      'base-tertiary': '#fafafa',
      'base-contrast': '#ffffff',
      // Border
      'base-border': '#dddddd',
      // Text
      text: '#3f3f3f',
      'text-secondary': '#858585',
      'text-tertiary': '#dddddd',
      // Accents
      accent: '#003d57',
      'accent-active': '#d57120',
      'accent-hover': '#939faa',
      // Information
      info: '#0b6f50',
      blocked: '#a21309',
      changed: '#ffffa7',
    }
```
*/
function toggleDarkMode(darkMode) {
  const root = document.querySelector(':root');

  const palettes = {
    dark: {
      base: '#222222',
      'base-secondary': '#555555',
      'base-tertiary': '#555555',
      'base-contrast': '#333333',
      'base-border': '#222222',
      text: '#f2f2f2',
      'text-secondary': '#858585',
      'text-tertiary': '#dddddd',
      accent: '#DAD095',
      'accent-active': '#e18335',
      blocked: '#ef5350',
    },
  };

  if (darkMode) {
    // match palette
    const palette = palettes.dark;

    // add defined variabled to the root style
    Object.entries(palette).map((entry) => {
      root.style.setProperty(`--color-${entry[0]}`, `${entry[1]}`);
    });
  } else {
    // remove variables from the root style. Bounce back to defaults in the ui stylesheet.
    Object.entries(palettes.default).map((entry) => {
      root.style.removeProperty(`--color-${entry[0]}`, `${entry[1]}`);
    });
  }
}
