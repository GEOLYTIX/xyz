export default function(theme, feature) {

  // The graduated theme requires feature.properties.
  if (!feature.properties) return;

  var catValue = Array.isArray(feature.properties.features) ?

    // Reduce array of features to sum catValue
    feature.properties.features.reduce((total, F) => total + Number(F.getProperties().properties[theme.field]), 0) :

    // Get catValue from cat or field property.
    parseFloat(feature.properties[theme.field]);

  if (!isNaN(catValue)) {

    let cat = {}

    // Iterate through cat array.
    for (let i = 0; i < theme.cat_arr.length; i++) {

      // Break iteration is cat value is below current cat array value.
      if (catValue <= parseFloat(theme.cat_arr[i].value)) break;

      // Set cat_style to current cat style after value check.
      cat = theme.cat_arr[i]
    }

    if (typeof cat.style === 'undefined') return;

    if (feature.geometryType === 'Point') {
  
      // Merge catStyle if icon style is not implicit.
      feature.style.icon = cat.style.icon || cat.style
      delete feature.style.icon.url;
      return;
    }

    feature.style = structuredClone(cat.style)
  }
}