const filter = {
  ni
}

export default function(filters, feature) {

  // check whether at least one filter catches feature.
  return Object.keys(filters).some(key => {

    // get feature type from first key.
    let type = Object.keys(filters[key])[0]

    // return filter method if exists.
    return filter[type] && filter[type](key, filters[key][type], feature)
  })
}

function ni(key, ni, feature) {

  // check whether feature properties key is in ni set.
  return new Set(ni).has(feature.properties[key])
}