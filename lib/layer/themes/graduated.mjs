/**
### mapp.layer.themes.graduates()
This module exports a function that applies a graduated theme to a feature based on a specified field value.
@module /layer/themes/graduated
*/

/**
@function graduated
@param {Object} theme - The theme configuration object.
@param {string} theme.field - The field name used for determining the category.
@param {Array} theme.categories - An array of category objects.
@param {string} theme.graduated_breaks - The comparison operator ("less" or "more").
@param {Object} feature - The feature object.
@param {Object} feature.properties - The properties of the feature.
@param {Array} [feature.properties.features] - An array of sub-features.
@returns {void}
 */
export default function (theme, feature) {
  // The graduated theme requires feature.properties.
  if (!feature.properties) return;

  const catValue = Array.isArray(feature.properties.features)
    ? // Reduce array of features to sum catValue
      feature.properties.features.reduce(
        (total, F) => total + Number(F.getProperties()[theme.field]),
        0,
      )
    : // Get catValue from cat or field property.
      parseFloat(feature.properties[theme.field]);

  if (!isNaN(catValue) && catValue !== null) {
    const graduated_breaks = {
      less_than: (val) => (cat) => val <= cat.value,
      greater_than: (val) => (cat) => val >= cat.value,
    };

    const index = theme.categories.findIndex(
      graduated_breaks[theme.graduated_breaks](catValue),
    );

    const cat = theme.categories.at(index);

    if (cat.style === null) {
      feature.style = null;
      return;
    }

    // Spread cat style to retain scale property
    feature.style = {
      ...feature.style,
      ...cat.style,
    };
  }
}
