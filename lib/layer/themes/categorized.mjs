export default function (theme, feature) {

  if (feature.style?.icon?.clusterScale) return;

  if (feature.properties?.features?.length > 1) return;

  const catValue = feature.properties.cat || feature.properties[theme.field]

  const cat = theme.cat[encodeURIComponent(catValue)] || theme.cat[catValue]

  if (!cat) return;

  const catStyle = cat.style || cat

  if (typeof catStyle === 'undefined') return;

  if (feature.geometryType === 'Point') {

    // Merge catStyle if icon style is not implicit.
    feature.style.icon = catStyle.icon || Object.assign(feature.style.icon, catStyle)
    delete feature.style.icon.url;
    return;
  }

  // Merge catStyle for vector features.
  mapp.utils.merge(feature.style, catStyle)
}