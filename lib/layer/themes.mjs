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
    theme.index = 0

    // test layer for visual check.
    // theme.source = new ol.source.Vector({
    //   useSpatialIndex: false
    // })

    // theme.L = new ol.layer.Vector({
    //   source: theme.source
    // })

    // layer.mapview.Map.addLayer(theme.L)

    theme.boxes = []

    theme.extentsSet = new Set()
  }

  if (theme.lookup[feature.properties[theme.field]]) {

    var catStyle = theme.lookup[feature.properties[theme.field]]
  } else {

    let geom = feature.getGeometry()

    let box = {
      extent: geom.getExtent()
    }

    let intersects

    if (!theme.extentsSet.has(feature.properties[theme.field])) {

      // add box to visual check layer.
      // theme.source.addFeature(new ol.Feature(new ol.geom.Polygon.fromExtent(box.extent)))

      intersects = theme.boxes.filter(b => !(box.extent[0] > b.extent[2]
        || box.extent[2] < b.extent[0]
        || box.extent[1] > b.extent[3]
        || box.extent[3] < b.extent[1]))

      theme.boxes.push(box)

      theme.extentsSet.add(feature.properties[theme.field])
    }

    let set = new Set(intersects.map(b => b.themeIdx))

    theme.index++

    if (theme.index === theme.cat_arr.length) theme.index = 0

    let i = !(set.has(theme.index)) && parseInt(theme.index)

    if (i === false) {

      for (let free = 0; free < theme.cat_arr.length; free++) {

        if (!set.has(free)) {
          i = free;
          break;
        }
      }
    }

    if (i === false) {

      // No free index in set of intersecting boxes.
      console.log(intersects.map(b => b.themeIdx))

      i = parseInt(theme.index)
    }

    box.themeIdx = i

    var catStyle = theme.cat_arr[i]

    theme.lookup[feature.properties[theme.field]] = catStyle
  }

  mapp.utils.merge(feature.style, catStyle)
}