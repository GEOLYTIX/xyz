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
export default function distributed(theme, feature, layer) {
  theme.lookup ??= {};
  theme.boxes ??= [];
  theme.field ??= 'id';

  // Get feature identifier for theme.
  let val = feature.properties[theme.field];

  // Assign theme.style if val is falsy.
  if (!val) {
    return;
  }

  //Cast feature to string after checking that is not undefined.
  val = String(val);

  // The feature field property value already has a style assigned.
  if (theme.lookup[val]) {
    feature.style = theme.lookup[val].style;
    return;
  }

  // Define as 0 or increase theme.index
  if (theme.index === undefined) {
    theme.index = 0;
  } else {
    theme.index++;
  }

  // Reset cat index to 0 if the index reaches the length of the cat array.
  if (theme.index === theme.categories.length) {
    theme.index = 0;
  }

  // Get feature bounding box from geometry extent.
  const bbox = {
    extent: feature.getGeometry().getExtent(),
  };

  if (!bbox.extent) return;

  // A point feature will have matching bbox corner coordinates.
  if (bbox.extent[0] === bbox.extent[2] && bbox.extent[1] === bbox.extent[3]) {
    bbox.themeIdx ??= theme.index;

    // Assign the style
    applyFeatureStyle(theme, feature, val, bbox);
    // Reapply the distributed legend as we need the features to be able generate the legend.
    mapp.ui.layers.legends.distributed(layer);

    return;
  }

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

  const set = new Set(intersects.map((item) => item.themeIdx));

  // Current index is already in set of intersecting boxes.
  if (set.has(theme.index)) {
    // Find index which is not in set if possible.
    for (let free = 0; free < theme.categories.length; free++) {
      if (set.has(free)) continue;
      // Assign free index and break loop.
      bbox.themeIdx = free;
      break;
    }
  }

  bbox.themeIdx ??= theme.index;

  // Assign the style
  applyFeatureStyle(theme, feature, val, bbox);

  // Reapply the distributed legend as we need the features to be able generate the legend.
  mapp.ui.layers.legends.distributed(layer);
}

/**
 * @function applyFeatureStyle
 * @description Apply the style to the feature and add the category to the theme lookup.
 * @param {Object} theme The theme configuration object.
 * @param {Object} feature The feature object.
 * @param {string} val The feature value for the theme field.
 * @param {Object} bbox The bounding box object for the feature.
 **/
function applyFeatureStyle(theme, feature, val, bbox) {
  // Create the category object for the value.
  // This is a copy of the category at theme.categories[bbox.themeIdx] to avoid mutating it and adding value and label properties.
  const category = {
    ...theme.categories[bbox.themeIdx],
    style: theme.categories[bbox.themeIdx].style,
    value: val,
    label: val,
    field: theme.field,
  };
  theme.lookup[val] = category;

  feature.style = theme.lookup[val].style;
}
