/**
### mapp.layer.featureFields{}

The `featureFormats` module has been moved from `mapp.utils.featureFormats` to `mapp.layer.featureFormats` to be in line with other mapp.layer modules.

The `featureFormat` methods process layer features for styling.

`featureFields` modules has been added to mapp.layer.

Field values are keys within the layer.featureFields{} object.

@module /layer/featureFields
*/

/**
featureFields.reset(layer) will reset the layer.featureFields
@param {Object} layer - The layer object.
*/
export function reset(layer) {
  // Create featureFields object if nullish.
  layer.featureFields ??= {};

  if (!layer.style.theme?.field) return;

  // Initialize featureFields for the specified field.
  layer.featureFields[layer.style.theme.field] = {
    values: []
  };
}

/**
featureFields.process(layer) will process the fields required for a theme and re-render the legend.
@param {Object} layer - The layer object.
*/
export function process(layer) {

  // Check if the distribution method is defined in the distribution object.
  if (Object.hasOwn(distribution, layer.style?.theme?.distribution)) {

    // Call the corresponding distribution function.
    distribution[layer.style.theme.distribution](layer);

    // Replace the legend with the appropriate type.
    layer.style.legend.replaceWith(mapp.ui.layers.legends[layer.style.theme.type](layer));
  }
}

/**
Distribution methods for processing layer data.

featureFields.distribution{} methods can be expanded to support different distributions.

@typedef {Object} distribution
@property {jenks} jenks Jenks natural breaks algorithm for thematic mapping.
@property {count} count Counts occurrences of values in a field.
*/
export const distribution = {
  jenks,
  count
}

/**
#### Jenks natural breaks algorithm for thematic mapping.

`featureFields.distribution.jenks` will process the featureField values array for the theme field to calculate the jenks based on the length of the graduated theme cat_array.

The cat values will be updated to represented the natural breaks before the layer and legend are rendered.

@param {Object} layer - The layer object.
*/
function jenks(layer) {
  let theme = layer.style.theme;

  let n = Math.min(layer.featureFields[theme.field].values.length, theme.categories.length);

  // Parse array values as float.
  layer.featureFields[theme.field].values = layer.featureFields[theme.field].values.map(parseFloat);

  // Compute Jenks natural breaks.
  layer.featureFields[theme.field].jenks =
    mapp.utils.stats.jenks(layer.featureFields[theme.field].values, n);

  let val;

  theme.categories.forEach((cat, i) => {
    val = val === layer.featureFields[theme.field].jenks[i] ? undefined : layer.featureFields[theme.field].jenks[i];
    cat.value = val;
  });
}

/**
Counts occurrences of values in a field.

@param {Object} layer - The layer object.
*/
function count(layer) {
  let theme = layer.style.theme;

  layer.featureFields[theme.field].values.forEach(val => {
    // Increment count for each value.
    layer.featureFields[theme.field][val] ??= 0;
    layer.featureFields[theme.field][val]++;
  });
}
