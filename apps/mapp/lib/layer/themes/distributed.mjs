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

A value which has been removed from the lookup by the retain method gets its previous category again, unless the category is used by an intersecting feature.

@param {Object} theme The theme configuration object.
@param {Object} feature The feature object.

@property {Array} theme.categories An array of category objects.
@property {Object} feature.properties The properties of the feature.
@property {string} [theme.field='id'] The field name used for determining the unique value.
@property {Object} [theme.lookup={}] An object mapping unique values to their assigned styles.
@property {Object} [theme.retired] An object mapping values removed from the lookup to their previous category.
@property {Array} [theme.boxes=[]] An array of bounding boxes for the features.
@property {number} [theme.index=0] The current index for assigning styles.
*/
export default function distributed(theme, feature) {
  theme.lookup ??= {};
  theme.boxes ??= [];
  theme.field ??= 'id';

  // Get the feature field value for the theme.
  const value = feature.properties[theme.field];

  // Do not style a feature without a value for the theme field.
  if (value === undefined || value === null || value === '') {
    return;
  }

  // The lookup key for the feature value.
  const val = String(value);

  // The feature field property value already has a style assigned.
  if (theme.lookup[val]) {
    feature.style = theme.lookup[val].style;
    return;
  }

  // The index of the category which was assigned to the value before it was retired.
  const previous = theme.categories.indexOf(theme.retired?.[val]);

  // The index in turn is not advanced for the previous category.
  if (previous < 0) {
    // Define as 0 or increase theme.index
    theme.index = theme.index === undefined ? 0 : theme.index + 1;

    // Reset cat index to 0 if the index reaches the length of the cat array.
    if (theme.index === theme.categories.length) {
      theme.index = 0;
    }
  }

  // The previous category or the category in turn.
  const index = previous >= 0 ? previous : theme.index;

  // Get feature bounding box from geometry extent.
  const bbox = {
    extent: feature.getGeometry().getExtent(),
    value: val,
  };

  if (!bbox.extent) return;

  // A point feature will have matching bbox corner coordinates.
  if (bbox.extent[0] === bbox.extent[2] && bbox.extent[1] === bbox.extent[3]) {
    assign(theme, val, index, feature);
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
  if (set.has(index)) {
    // Find index which is not in set if possible.
    for (let free = 0; free < theme.categories.length; free++) {
      if (set.has(free)) continue;
      // Assign free index and break loop.
      bbox.themeIdx = free;
      break;
    }
  }

  bbox.themeIdx ??= index;

  assign(theme, val, bbox.themeIdx, feature);
}

/**
@function assign
@description
Assigns the category with the index to the value in the theme lookup, records the value on the category, and assigns the category style to the feature.

@param {Object} theme The theme configuration object.
@param {string} val The lookup key for the feature value.
@param {number} index The index of the category.
@param {Object} feature The feature object.
*/
function assign(theme, val, index, feature) {
  theme.lookup[val] = theme.categories[index];

  // The value is no longer retired.
  delete theme.retired?.[val];

  // The value is recorded on the assigned category, not the index in turn.
  theme.categories[index].values ??= [];
  theme.categories[index].values.push(val);

  feature.style = theme.lookup[val].style;
}

/**
@function retain
@description
The retain method removes the values which are not in the features argument from the theme lookup, the category values, and the bounding boxes. The method is called with the feature properties of a layer data response, eg. after a feature has been deleted.

The category of a value in the features keeps its lookup entry, so the feature keeps its colour. The category of a removed value is kept as theme.retired, so a feature which is in the data again, eg. after the mapview is panned back, gets its previous category if no intersecting feature uses it.

A category without values is not drawn in the legend.

@param {Object} theme The distributed theme.
@param {Object} features The feature properties of the layer data, keyed by feature ID.
*/
function retain(theme, features) {
  if (!theme.lookup) return;

  theme.field ??= 'id';

  const values = new Set();

  for (const properties of Object.values(features)) {
    const value = properties[theme.field];

    if (value === undefined || value === null || value === '') continue;

    values.add(String(value));
  }

  theme.retired ??= {};

  for (const val of Object.keys(theme.lookup)) {
    if (values.has(val)) continue;

    theme.retired[val] = theme.lookup[val];

    delete theme.lookup[val];
  }

  for (const cat of theme.categories) {
    if (!cat.values) continue;

    cat.values = cat.values.filter((val) => values.has(val));

    if (!cat.values.length) delete cat.values;
  }

  theme.boxes = theme.boxes?.filter((bbox) => values.has(bbox.value));
}

distributed.retain = retain;
