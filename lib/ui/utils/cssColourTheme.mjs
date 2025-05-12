/**
# /ui/utils/cssColourTheme

The cssColourTheme utility module method allows to override the default mapp colour theme.

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

### info `#0b6f50`
The info colour is a prominent colour indicating information, confirmation, availability, valid state. It is applied to a symbol in order to attract attention.

### danger `#a21309`
The danger colour is a strong colour indicating error, invalid data, irreversible actions, logout. Applied to a symbol in order to indicate an important action.


@module /ui/utils/cssColourTheme
*/

export const themes = {
  dark: {
    active: '#e18335',
    base: '#222222',
    'base-secondary': '#555555',
    'base-tertiary': '#444444',
    border: '#666666',
    changed: '#666600',
    danger: '#ef5350',
    font: '#f2f2f2',
    'font-contrast': '#3f3f3f',
    'font-mid': '#CCCCCC',
    primary: '#DAD095',
  },
};

/**
@function setTheme
@description
The setTheme method receives an object of colour variables.

The key identifies the colour variable `--color-[key]`.

The property value defines the colour variable value.

The method removes the currentTheme colour variables before assigning the colourTheme variables as currentTheme.

@param {Object} colourTheme The colourTheme to be applied.
*/
let currentTheme = {};
export function setTheme(colourTheme) {
  const root = document.querySelector(':root');

  for (const [key, value] of Object.entries(currentTheme)) {
    root.style.removeProperty(`--color-${key}`, `${value}`);
  }

  currentTheme = colourTheme;

  for (const [key, value] of Object.entries(currentTheme)) {
    root.style.setProperty(`--color-${key}`, `${value}`);
  }
}
