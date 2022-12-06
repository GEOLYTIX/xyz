export default function (theme, feature) {

  const catValue = feature.properties.cat || feature.properties[theme.field]

  const catStyle = theme.cat[catValue]?.style || theme.cat[catValue]

  if (typeof catStyle === 'undefined') return;

  if (feature.geometryType === 'Point') {

    // Clone catStyle as icon style if not implicit.
    feature.style.icon = catStyle.icon || mapp.utils.clone(catStyle)
    return;
  }

  // Merge catStyle for vector features.
  mapp.utils.merge(feature.style, catStyle)
}