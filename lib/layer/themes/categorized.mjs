export default function (theme, feature) {

  const catValue = feature.properties.cat || feature.properties[theme.field]

  const catStyle = theme.cat[encodeURIComponent(catValue)]?.style
    || theme.cat[catValue]?.style
    || theme.cat[encodeURIComponent(catValue)]
    || theme.cat[catValue]

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