/**
### mapp.layer.themes.basic()
This module exports a function that assigns the theme.style as feature.style
@module /layer/themes/categorized

@function categorized
@param {Object} theme - The theme configuration object.
@param {Object} feature - The feature object.
*/
export default function (theme, feature) {

  feature.style = theme.style
}