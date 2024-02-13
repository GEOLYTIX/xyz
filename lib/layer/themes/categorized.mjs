export default function (theme, feature) {

  if (feature.style?.icon?.clusterScale) return;

  if (feature.properties?.features?.length > 1) return;

  const catValue = feature.properties.cat || feature.properties[theme.field]

  const cat = theme.cat[encodeURIComponent(catValue)] || theme.cat[catValue]

  if (!cat) return;

  if (typeof cat.style === 'undefined') return;

  if (feature.geometryType === 'Point') {

    // Merge catStyle if icon style is not implicit.
    feature.style.icon = cat.style.icon || cat.style
    delete feature.style.icon.url;
    return;
  }

  feature.style = cat.style
}