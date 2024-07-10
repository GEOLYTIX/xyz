/**
### mapp.layer.themes.categorized()

The module exports the categorized function as a mapp.layer.theme. 

@module /layer/themes/categorized
*/

/**
@function categorized

@description
The categorized theme method will assign a style from category matching the features properties.

Cluster features may not be styled by a categorized theme.

A theme can have a fields array to apply an icon style array for the individual property fields.

@param {Object} theme The theme configuration object.
@param {string} [theme.field] The feature property field to theme.
@param {array} [theme.fields] A fields array to style multiple feature properties.
@param {Array} theme.categories
@param {Object} feature
@param {Object} feature.properties
@param {Array} [feature.properties.features] A cluster feature will have a features array property.
*/

export default function categorized(theme, feature) {

  // The categorized theme requires feature.properties.
  if (!feature.properties) return;

  // Cluster features can not be styled by category.
  if (feature.properties.features?.length > 1) return;

  let flat;

  // Theme is using multiple fields.
  if (Array.isArray(theme.fields)) {

    // Map different theme fields
    feature.style.icon = theme.fields.map(field => {

      // Get the field value from feature properties
      const catValue = feature.properties[field]

      // Find category matching field and catValue
      const cat = theme.categories.find(cat => (cat.value === encodeURIComponent(catValue) || cat.value === catValue) && cat.field === field)

      if (!cat) return;

      flat ||= Array.isArray(cat.style.icon)

      return cat.style.icon
    
    // Filter out empty icon entries from map response.
    }).filter(icon => !!icon);

    if (flat) {

      feature.style.icon = feature.style.icon.flat()
    }

    return;
  }

  const catValue = feature.properties[theme.field]

  const cat = theme.categories.find(cat => cat.value === encodeURIComponent(catValue) || cat.value === catValue)

  if (!cat) return;

  // Spread cat style to retain scale property
  feature.style = {
    ...feature.style,
    ...cat.style
  }
}