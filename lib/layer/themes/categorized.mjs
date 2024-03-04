export default function (theme, feature) {

  // The categorized theme requires feature.properties.
  if (!feature.properties) return;

  // Cluster features can not be styled by category.
  if (feature.properties.features?.length > 1) return;

  const catValue = feature.properties[theme.field]

  const cat = theme.cat[encodeURIComponent(catValue)] || theme.cat[catValue]

  if (!cat) return;

  if (typeof cat.style === 'undefined') return;

  if (feature.geometryType === 'Point') {

    feature.style = {
      icon: cat.style.icon
    }

  } else {

    feature.style = cat.style
  }
}