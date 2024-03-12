export default function(theme, feature) {

  // The graduated theme requires feature.properties.
  if (!feature.properties) return;

  let catValue = Array.isArray(feature.properties.features) ?

    // Reduce array of features to sum catValue
    feature.properties.features.reduce((total, F) => total + Number(F.getProperties().properties[theme.field]), 0) :

    // Get catValue from cat or field property.
    parseFloat(feature.properties[theme.field]);

  if (!isNaN(catValue) && catValue !== null) {

    const chk = {
      "less": val => cat => val <= cat.value,
      "more": val => cat => val >= cat.value
    }

    let index = theme.cat_arr.findIndex(chk[theme.chk](catValue))

    let cat = theme.cat_arr.at(index)

    feature.style = cat.style
  }
}