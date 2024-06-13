/**
### mapp.layer.themes.categorized()
This module exports a function that applies a categorized theme to a feature based on a specified field value.
@module /layer/themes/categorized
 */

/**

 * @function categorized
 * @param {Object} theme - The theme configuration object.
 * @param {string} theme.field - The field name used for determining the category.
 * @param {Array} theme.categories - An array of category objects.
 * @param {Object} feature - The feature object.
 * @param {Object} feature.properties - The properties of the feature.
 * @param {Array} [feature.properties.features] - An array of clustered features.
 * @returns {void}
 */
export default function (theme, feature) {

  // The categorized theme requires feature.properties.
  if (!feature.properties) return;

  // Cluster features can not be styled by category.
  if (feature.properties.features?.length > 1) return;

  if (Array.isArray(theme.fields)) {

    feature.style.icon = theme.fields
    .map(field => {

      const catValue = feature.properties[field]

      const cat = theme.categories.find(cat => (cat.value === encodeURIComponent(catValue) || cat.value === catValue) && cat.field === field)

      if (!cat) return;

      if (!cat.style.icon) return;

      if (Array.isArray(cat.style.icon)) return;

      return cat.style.icon
    })
    .filter(icon => !!icon);

    return;
  }

  const catValue = feature.properties[theme.field]

  const cat = theme.categories.find(cat => cat.value === encodeURIComponent(catValue) || cat.value === catValue)

  if (!cat) return;

  feature.style = cat.style
}