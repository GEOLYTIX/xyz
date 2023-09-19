export default function(theme, feature) {

  if (feature.style?.icon?.clusterScale) return;

  var catValue = Array.isArray(feature.properties.features) ?

    // Reduce array of features to sum catValue
    feature.properties.features.reduce((total, F) => total + Number(F.getProperties().properties[theme.field]), 0) :

    // Get catValue from cat or field property.
    parseFloat(feature.properties.cat || feature.properties[theme.field]);

  if (!isNaN(catValue)) {

    // Iterate through cat array.
    for (let i = 0; i < theme.cat_arr.length; i++) {

      // Break iteration is cat value is below current cat array value.
      if (catValue < parseFloat(theme.cat_arr[i].value)) break;

      // Set cat_style to current cat style after value check.
      var catStyle = mapp.utils.clone(theme.cat_arr[i].style || theme.cat_arr[i])

      delete catStyle.label
    }

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
}