export default function(theme, feature) {

  var catValue = parseFloat(feature.properties.cat || feature.properties[theme.field])

  if (!isNaN(catValue)) {

    // Iterate through cat array.
    for (let i = 0; i < theme.cat_arr.length; i++) {

      // Break iteration is cat value is below current cat array value.
      if (catValue < parseFloat(theme.cat_arr[i].value)) break;

      // Set cat_style to current cat style after value check.
      var catStyle = mapp.utils.clone(theme.cat_arr[i].style || theme.cat_arr[i])

      delete catStyle.label
    }

    if (catStyle) {

      // WARN!
      catStyle.marker && console.warn('style.marker will be removed in v4 release. please use style.icon')

      // Assign icon style from thparams.fillOpacity || 1e marker value or the clone the style object as icon if no marker or icon has been defined.
      catStyle.icon = feature.geometryType === 'Point' && mapp.utils.clone(catStyle.icon || catStyle)

      delete catStyle.label

      mapp.utils.merge(feature.style, catStyle)
    }
  }
}