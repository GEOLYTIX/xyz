/**
## /layer/themes/categorized

The layer theme module exports a method for categorized themes.

@module /layer/themes/categorized
*/

/**
@function categorized

@description
The categorized theme method will assign a style from category matching the features properties.

Cluster features may not be styled by a categorized theme.

A theme can have a fields array to apply an icon style array for the individual property fields.

@param {Object} theme The theme configuration object.
@param {Object} feature The feature object.
@property {Array} theme.categories
@property {string} [theme.field] The feature property field to theme.
@property {array} [theme.fields] A fields array to style multiple feature properties.
@property {Object} feature.properties
@property {Array} [properties.features] A cluster feature will have a features array property.
*/
export default function categorized(theme, feature) {
  // The categorized theme requires feature.properties.
  if (!feature.properties) return;

  // Cluster features can not be styled by category.
  if (feature.properties.features?.length > 1) return;

  // Theme is using multiple fields.
  if (Array.isArray(theme.fields)) {
    const icons = [];
    feature.style.icon = [];

    for (const field of theme.fields) {
      // Get the field value from feature properties
      const catValue = feature.properties[field];

      // Find category matching field and catValue
      const cat = theme.categories.find(
        (cat) =>
          (cat.value === encodeURIComponent(catValue) ||
            cat.value === catValue) &&
          cat.field === field,
      );

      if (!cat) continue;

      if (!cat.style) continue;

      if (!cat.style.icon) continue;

      Array.isArray(cat.style.icon)
        ? feature.style.icon.push(...cat.style.icon)
        : feature.style.icon.push(cat.style.icon);
    }

    // Do not assign theme.field is theme.fields are parsed.
    return;
  }

  const catValue = feature.properties[theme.field];

  const cat = theme.categories.find(
    (cat) =>
      cat.value === encodeURIComponent(catValue) || cat.value === catValue,
  );

  if (!cat) return;

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
