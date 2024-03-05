export default function(theme, feature) {

  if (feature.style?.icon?.clusterScale) return;

  var catValue = Array.isArray(feature.properties.features) ?

    // Reduce array of features to sum catValue
    feature.properties.features.reduce((total, F) => total + Number(F.getProperties().properties[theme.field]), 0) :

    // Get catValue from cat or field property.
    parseFloat(feature.properties.cat || feature.properties[theme.field]);

  if (!isNaN(catValue) && catValue !== null) {

    const isLassThan = cat => catValue <= cat.value;

    let index = theme.cat_arr.findIndex(isLassThan)

    let cat = theme.cat_arr.at(index)

    let catStyle = structuredClone(cat.style || cat)

    delete catStyle.label

    mapp.utils.merge(feature.style, catStyle)
  }
}