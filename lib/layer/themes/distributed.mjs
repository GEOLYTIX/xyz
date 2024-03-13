/**
### mapp.layer.themes.distributed()
This module exports a function that applies a unique value theme to a feature based on a specified field value.
@module /layer/themes/distributed
 */

/**

 * @function distributed
 * @param {Object} theme - The theme configuration object.
 * @param {string} [theme.field='id'] - The field name used for determining the unique value.
 * @param {Object} [theme.lookup={}] - An object mapping unique values to their assigned styles.
 * @param {Array} [theme.boxes=[]] - An array of bounding boxes for the features.
 * @param {number} [theme.index=0] - The current index for assigning styles.
 * @param {Array} theme.cat_arr - An array of category objects containing styles.
 * @param {Object} feature - The feature object.
 * @param {Object} feature.properties - The properties of the feature.
 * @returns {void}
 */
export default function(theme, feature) {

  if (!theme.lookup) {
    theme.lookup = {}
    theme.boxes = []
    theme.index = 0
  }

  // Get feature identifier for theme.
  const ID = feature.properties[theme.field || 'id'] || 0

  // The feature field property value already has a style assigned.
  if (theme.lookup[ID]) {

    feature.style = theme.lookup[ID].style
    return;
  }

  // Get feature bounding box from geometry extent.
  const bbox = {
    extent: feature.getGeometry().getExtent()
  }

  // Find intersecting bounding boxes with their assigned cat index.
  const intersects = theme.boxes.filter(b => !(bbox.extent[0] > b.extent[2]
    || bbox.extent[2] < b.extent[0]
    || bbox.extent[1] > b.extent[3]
    || bbox.extent[3] < b.extent[1]))

  // Push the current bbox into the array.
  theme.boxes.push(bbox)

  // Create a set of cat indices from intersecting bounding boxes.
  const set = new Set(intersects.map(b => b.themeIdx))

  // Increase the current cat indix.
  theme.index++

  // Reset cat index to 0 if the index reaches the length of the cat array.
  if (theme.index === theme.cat_arr.length) theme.index = 0

  // i is the cat index if not in set of intersecting boxes.
  let i = !(set.has(theme.index)) && parseInt(theme.index)

  // Current index is already in set of intersecting boxes.
  if (i === false) {

    // Iterate through the cat array.
    for (let free = 0; free < theme.cat_arr.length; free++) {

      // Find an index which is not in set of intersecting bbox indices.
      if (!set.has(free)) {

        // Assign free index and break loop.
        i = free;
        break;
      }
    }
  }

  // Any index is in set of intersecting box indices.
  if (i === false) {

    // Just assign the current index. It is not possible to prevent some neighbouring cats.
    i = parseInt(theme.index)
  }

  // Assign index to the bounding box which is stored in the array of bounding boxes.
  bbox.themeIdx = i

  // Assign the style to the lookup object for the feature field property value.
  theme.lookup[ID] = theme.cat_arr[i]

  feature.style = theme.lookup[ID].style
}