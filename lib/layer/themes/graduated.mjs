export default function(theme, feature) {

  if (feature.style?.icon?.clusterScale) return;

  var catValue = Array.isArray(feature.properties.features) ?

    // Reduce array of features to sum catValue
    feature.properties.features.reduce((total, F) => total + Number(F.getProperties().properties[theme.field]), 0) :

    // Get catValue from cat or field property.
    parseFloat(feature.properties.cat || feature.properties[theme.field]);

  if (!isNaN(catValue) && catValue !== null) {

    let catStyle;
    // Iterate through cat array.
    for (let i = 0; i < theme.cat_arr.length; i++) {
      theme.cat_arr[i].style ??= theme.cat_arr[i]  

      // Break iteration is cat value is below current cat array value.
      if (catValue <= parseFloat(theme.cat_arr[i].value)){

        //Set a style if one has not been set yet
        if(!catStyle){
          catStyle ??= structuredClone(theme.cat_arr[i].style)
          delete catStyle.label
        }
        break;
      } 

      //Set the style for the element
      catStyle = structuredClone(theme.cat_arr[i].style)
      delete catStyle.label

    }
  
    // Merge catStyle for vector features.
    mapp.utils.merge(feature.style, catStyle)
  }
}