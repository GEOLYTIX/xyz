/**
## /layer/themes/distributed

The layer theme module exports a method for distributed themes.

@module /layer/themes/distributed
*/

/**
@function distributed
@description
The distributed theme method assign a style to a feature from the themes categories array.

The method will iterate of features which intersect the bounding box of the current feature and attempts to assign a category style which isn't used by any intersecting feature.

@param {Object} theme The theme configuration object.
@param {Object} feature The feature object.

@property {Array} theme.categories An array of category objects.
@property {Object} feature.properties The properties of the feature.
@property {string} [theme.field='id'] The field name used for determining the unique value.
@property {Object} [theme.lookup={}] An object mapping unique values to their assigned styles.
@property {Array} [theme.boxes=[]] An array of bounding boxes for the features.
@property {number} [theme.index=0] The current index for assigning styles.
*/
export default function distributed(theme, feature) {
  theme.lookup ??= {};
  theme.boxes ??= [];
  theme.index ??= 0;
  theme.field ??= 'id';

  // Get feature identifier for theme.
  const val = feature.properties[theme.field];

  // Assign theme.style if val is falsy.
  if (!val) return;

  // The feature field property value already has a style assigned.
  if (theme.lookup[val]) {
    feature.style = theme.lookup[val].style;
    return;
  }

  // Get feature bounding box from geometry extent.
  const bbox = {
    extent: feature.getGeometry().getExtent(),
  };

  // Find intersecting bounding boxes with their assigned cat index.
  const intersects = theme.boxes.filter(
    (b) =>
      !(
        bbox.extent[0] > b.extent[2] ||
        bbox.extent[2] < b.extent[0] ||
        bbox.extent[1] > b.extent[3] ||
        bbox.extent[3] < b.extent[1]
      ),
  );

  // Push the current bbox into the array.
  theme.boxes.push(bbox);

  // Create a set of cat indices from intersecting bounding boxes.
  const set = new Set(intersects.map((b) => b.themeIdx));

  // Increase the current cat indix.
  theme.index++;

  // Reset cat index to 0 if the index reaches the length of the cat array.
  if (theme.index === theme.categories.length) theme.index = 0;

  // i is the cat index if not in set of intersecting boxes.
  bbox.themeIdx = theme.index; //!set.has(theme.index) //&& parseInt(theme.index);

  // Current index is already in set of intersecting boxes.
  if (!set.has(theme.index)) {
    // Find index which is not in set if possible.
    for (let free = 0; free < theme.categories.length; free++) {
      if (set.has(free)) continue;
      // Assign free index and break loop.
      bbox.themeIdx = free;
      break;
    }
  }

  // Assign the style to the lookup object for the feature field property value.
  theme.lookup[val] = theme.categories[bbox.themeIdx];

  feature.style = theme.lookup[val].style;
}
