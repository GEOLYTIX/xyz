/**
# /ui/utils/cssColourTheme

The cssColourTheme utility module defines a default colour theme to be applied in combination with a custom colour theme through the setTheme method.

### base `#f2f2f2`
The base colour is currently applied to tabview elements and the #ctrls element in the default view.

### base-secondary `#f2f2f2`
The secondary base colour is applied to dialog backgrounds.

@module /ui/utils/cssColourTheme
*/

const defaultTheme = {
  base: '#f2f2f2',
  'base-secondary': '#f2f2f2',
  'base-tertiary': '#fafafa',
  'base-contrast': '#ffffff',
  'base-border': '#dddddd',
  text: '#3f3f3f',
  'text-secondary': '#858585',
  'text-tertiary': '#dddddd',
  accent: '#003d57',
  'accent-active': '#d57120',
  'accent-hover': '#939faa',
  info: '#0b6f50',
  danger: '#a21309',
  changed: '#ffffa7',
};

/**
@function setTheme
@description
The setTheme method receives an object of colour variables.

The key identifies the colour variable `--color-[key]`.

The property value defines the colour variable value.

The setTheme method merges the colourTheme param with the defaultTheme before iterating through the colour properties. Providing an empty object as colourTheme param will result in the default theme being applied.

@param {Object} colourTheme The colourTheme to be applied.
*/
export default function setTheme(colourTheme) {
  const root = document.querySelector(':root');

  colourTheme = Object.assign(structuredClone(defaultTheme), colourTheme);

  // add defined variabled to the root style
  Object.entries(colourTheme).map((entry) => {
    root.style.setProperty(`--color-${entry[0]}`, `${entry[1]}`);
  });
}
