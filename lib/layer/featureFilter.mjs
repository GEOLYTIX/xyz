/**
### mapp.layer.featureFilter()
This module provides feature filtering functionality for map layers.

@module /layer/featureFilter
*/

const filter = {
  ni
}

/**
@function featureFilter

@param {Object} filters - The filters to apply to the features.
@param {Object} feature - The feature to filter.

@returns {boolean} - Returns true if at least one filter catches the feature, false otherwise.
*/
export default function(filters, feature) {

  // check whether at least one filter catches feature.
  return Object.keys(filters).some(key => {

    // get feature type from first key.
    let type = Object.keys(filters[key])[0]

    // return filter method if exists.
    return filter[type] && filter[type](key, filters[key][type], feature)
  })
}

/**
@function ni

@param {string} key - The property key to check in the feature.
@param {Array} ni - An array of values that the feature property should not be in.
@param {Object} feature - The feature to filter.

@returns {boolean} - Returns true if the feature property is not in the "ni" set, false otherwise.
*/
function ni(key, ni, feature) {

  // check whether feature properties key is in ni set.
  return new Set(ni).has(feature.properties[key])
}
