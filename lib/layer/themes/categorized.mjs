export default function(theme, feature) {

  var catValue = feature.properties.cat || feature.properties[theme.field]

  var catStyle = theme.cat && (theme.cat[catValue]?.style || theme.cat[catValue])

  if (catValue && typeof catStyle === 'undefined') {

    var entry = Object.values(theme.cat)
      .filter(entry => Array.isArray(entry.keys))
      .find(entry => entry.keys.includes(catValue))

    var catStyle = mapp.utils.clone(entry?.style || entry)

    catStyle && delete catStyle.label
  }

  if (typeof catStyle !== 'undefined') {

    // WARN!
    catStyle.marker && console.warn('style.marker will be removed in v4 release. please use style.icon')

    // Assign icon style from the marker value or the clone the style object as icon if no marker or icon has been defined.
    catStyle.icon = feature.geometryType === 'Point' && mapp.utils.clone(catStyle.icon || catStyle)

    delete catStyle.label

    mapp.utils.merge(feature.style, catStyle)
  }
}