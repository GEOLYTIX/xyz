/**
 * # layer/featureFields
 * 
 * 
 * 
 * 
 * @module layer/featureFields
 */

/**
 * Resets the featureFields object of the layer.
 * @param {Object} layer - The layer object.
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
 * Processes the layer based on the style theme.
 * @param {Object} layer - The layer object.
 */
export function process(layer) {
  // Check if the distribution method is defined in the distribution object.
  if (Object.hasOwnProperty(distribution, layer.style?.theme?.distribution)) {
    // Call the corresponding distribution function.
    distribution[layer.style.theme.distribution](layer);

    // Replace the legend with the appropriate type.
    layer.style.legend.replaceWith(mapp.ui.layers.legends[layer.style.theme.type](layer));
  }
}

/**
 * Distribution methods for processing layer data.
 */
export const distribution = {
  jenks,
  count
}

/**
 * Jenks natural breaks algorithm for thematic mapping.
 * @param {Object} layer - The layer object.
 */
function jenks(layer) {
  let theme = layer.style.theme;

  let n = Math.min(layer.featureFields[theme.field].values.length, theme.cat_arr.length);

  // Parse array values as float.
  layer.featureFields[theme.field].values = layer.featureFields[theme.field].values.map(parseFloat);

  // Compute Jenks natural breaks.
  layer.featureFields[theme.field].jenks =
    mapp.utils.stats.jenks(layer.featureFields[theme.field].values, n);

  let val;

  theme.cat_arr.forEach((cat, i) => {
    val = val === layer.featureFields[theme.field].jenks[i] ? undefined : layer.featureFields[theme.field].jenks[i];
    cat.value = val;
  });
}

/**
 * Counts occurrences of values in a field.
 * @param {Object} layer - The layer object.
 */
function count(layer) {
  let theme = layer.style.theme;

  layer.featureFields[theme.field].values.forEach(val => {
    // Increment count for each value.
    layer.featureFields[theme.field][val] ??= 0;
    layer.featureFields[theme.field][val]++;
  });
}
