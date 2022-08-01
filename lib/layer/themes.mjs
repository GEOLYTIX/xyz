export default {
  categorized,
  graduated,
  distributed
}

function categorized(theme, feature) {

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

function graduated(theme, feature) {

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

function distributed(theme, feature) {

  if (!theme.lookup) {

    theme.lookup = {}
    theme.boxes = []
    theme.index = 0

    // test layer for visual check.
    // theme.source = new ol.source.Vector({
    //   useSpatialIndex: false
    // })
    // theme.L = new ol.layer.Vector({
    //   source: theme.source
    // })
    // layer.mapview.Map.addLayer(theme.L)
  }

  // The feature field property value already has a style assigned.
  if (theme.lookup[feature.properties[theme.field]]) {

    // Assign style from lookup object.
    var catStyle = theme.lookup[feature.properties[theme.field]]
    mapp.utils.merge(feature.style, catStyle)
    return;
  }

  // Get feature bounding box from geometry extent.
  let bbox = {
    extent: feature.getGeometry().getExtent()
  }

  // add box to visual check layer.
  // theme.source.addFeature(new ol.Feature(new ol.geom.Polygon.fromExtent(bbox.extent)))

  // Find intersecting bounding boxes with their assigned cat index.
  let intersects = theme.boxes.filter(b => !(bbox.extent[0] > b.extent[2]
    || bbox.extent[2] < b.extent[0]
    || bbox.extent[1] > b.extent[3]
    || bbox.extent[3] < b.extent[1]))

  // Push the current bbox into the array.
  theme.boxes.push(bbox)

  // Create a set of cat indices from intersecting bounding boxes.
  let set = new Set(intersects.map(b => b.themeIdx))

  // Increase the cat indix.
  theme.index++

  // Reset cat index to 0 if the index reaches the length of the cat array.
  if (theme.index === theme.cat_arr.length) theme.index = 0

  // Check whether the set of intersecting bounding boxes has NOT the cat index.
  let i = !(set.has(theme.index)) && parseInt(theme.index)

  // Index is not available.
  if (i === false) {

    // Iterate through the cat array.
    for (let free = 0; free < theme.cat_arr.length; free++) {

      if (!set.has(free)) {

        // Assign free index and break loop.
        i = free;
        break;
      }
    }
  }

  // No index is available.
  if (i === false) {

    // Assign cat index.
    i = parseInt(theme.index)
  }

  // Assign index to the bounding box which is stored in the array of bounding boxes.
  bbox.themeIdx = i

  // Get the JSON style from cat array via index.
  var catStyle = theme.cat_arr[i]

  // Assign the JSON style to the lookup object for the feature field property value.
  theme.lookup[feature.properties[theme.field]] = catStyle

  // Merge the cat style with the feature style.
  mapp.utils.merge(feature.style, catStyle)
}