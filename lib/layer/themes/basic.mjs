/**
## layer/themes/basic
This basic theme module exports a function to support a `type:basic` theme.

@module /layer/themes/basic
*/

/**
@function basic

@description
The basic [theme] method spreads the theme.style object into the feature.style.

@param {Object} theme The layer.style.theme object.
@param {Object} feature - The feature object.
*/

export default function basic(theme, feature) {

  // Spread theme style to retain scale property
  feature.style = {
    ...feature.style,
    ...theme.style
  }
}