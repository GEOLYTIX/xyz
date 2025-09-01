/**
## /layer/themes/graduated

The layer theme module exports a method for graduated themes.

@module /layer/themes/graduated
*/

/**
@function graduated
@description
The graduated theme method iterates through the ordered categories array and compares a numeric feature field value with the category.
The iteration will break if the field value exceeds the category value.

@param {Object} theme The theme configuration object.
@param {Object} feature The feature object.
@property {string} theme.field The field name used for determining the category.
@property {Array} theme.categories An array of category objects.
@property {string} theme.graduated_breaks The comparison operator ("less" or "more").
@property {Object} feature.properties The properties of the feature.
@property {Array} [properties.features] An array of sub-features.
*/
export default function graduated(theme, feature) {
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
      greater_than: (val) => (cat) => val >= cat.value,
      less_than: (val) => (cat) => val <= cat.value,
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
