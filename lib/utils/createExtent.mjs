/**
@function createExtent
@async

@description
Given an array containing extents determines the largest 

@property {Array} extents An array of functions or extents
@returns {Promise<Array>} The largest extent.
*/
export default async function createExtent(extents) {
  const overall_extent = ol.extent.createEmpty();

  for (const key of Object.keys(extents)) {
    //await extent function if it is one
    const extent_value =
      typeof extents[key] === 'function' ? await extents[key]() : extents[key];

    //extend the extent to create the greates one
    Array.isArray(extent_value) &&
      ol.extent.extend(overall_extent, extent_value);
  }

  return overall_extent;
}
