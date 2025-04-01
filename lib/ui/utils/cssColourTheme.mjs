/**
# /ui/utils/cssColourTheme

The cssColourTheme utility module defines a default colour theme to be applied in combination with a custom colour theme through the setTheme method.

### primary `#003d57`
The primary colour provides identity to a theme and should be strong and significantly different to the base colour. This colour will be used for labelling interactive buttons, links and symbols. It can be also be used as background for headers and labels.

### base `#f2f2f2`
The base colour is the document body background and the background for all element base elements which should not standout from the background. Dialogs should have the base background for elements to work in either a dialog or in the body of an application view document.

### base-secondary `#f7f7f7`
The secondary base colour should slightly accentuate items rendered relative to the elements with a base background.

### base-tertiary `#fafafa`
The tertiary base colour should slightly accentuate items rendered relative to the elements with a secondary base background.

### font `#3f3f3f`
The default colour for font characters and icons.

### font-mid `#858585`
The font colour should sit between the default and the contrasting font colour.

### font-contrast `#dddddd`
The font colour must be contrasting to the default font colour to work on a background.

### border `#dddddd`
The default colour for all element borders and box-shadows.

### active `#d57120`
The active colour is applied where an active class requires a colour change to indicate that an element is active.

### hover `#939faa`
The hover colour is applied to element backgrounds in a state of hover.

### changed `#ffffa7`
The changed colour is applied to element backgrounds with a class representing a changed state.

@module /ui/utils/cssColourTheme
*/

const defaultTheme = {
  primary: '#003d57',
  base: '#f2f2f2',
  'base-secondary': '#f7f7f7',
  'base-tertiary': '#fafafa',
  border: '#dddddd',
  font: '#3f3f3f',
  'font-mid': '#858585',
  'font-contrast': '#dddddd',
  active: '#d57120',
  danger: '#a21309',
  changed: '#ffffa7',
  hover: '#939faa',
  info: '#0b6f50',
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
