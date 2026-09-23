/**
## /layer/featureFields

The featureFields module exports methods to reset and process the layer.featureFields{} object.

The layer.featureFields{} object has field properties for each field in the layer.params.fields[] array.

The layer.params.fields[] array will be populated from the fieldsArray method prior to requesting features to be added to an Openlayers layer source.

The featureFields.process() method will be called from the featureFormats methods while creating Openlayers features.

@module /layer/featureFields
*/

/**
The processedThemes WeakMap holds the theme for which the distribution of the current layer data has been processed.

The legend of a theme with a data distribution must only be drawn once the distribution has been processed from the layer data. A legend drawn prior would create the icons for every category in the theme configuration, which may be thousands of categories not present in the data.
*/
const processedThemes = new WeakMap();

/**
@function reset

@description
featureFields.reset(layer) method will reset the layer.featureFields{} object and create empty field.values[] arrays each field in the layer.params.fields[] array.

The processed distribution of the previous layer data is invalidated.

@param {layer} layer A decorated mapp layer object.
@property {Object} layer.params
@property {Array} params.fields Array of strings for feature property fields.
*/
export function reset(layer) {
  processedThemes.delete(layer);

  if (!layer.params.fields) return;

  // Create featureFields object if nullish.
  layer.featureFields ??= {};

  layer.params.fields.forEach((field) => {
    // Set empty values array.
    layer.featureFields[field] = {
      values: [],
    };
  });
}

/**
@function process

@description
The featureFields.process(layer) method will calculate the distribution of featureFields fields.values[] for featureStyle methods.

@param {layer} layer A decorated mapp layer object.
@property {layer-style} layer.style The layer style configuration.
@property {Object} style.icon_scaling Configuration to scale style icons for point features.
@property {Object} style.theme The current theme to style features according to their properties.
*/
export async function process(layer) {
  if (layer.style.icon_scaling?.field) {
    const numbers = layer.featureFields[layer.style.icon_scaling?.field].values
      .map(Number)
      .filter((n) => !Number.isNaN(Number(n)));

    layer.style.icon_scaling.max = Math.max(...numbers);
  }

  // Check if the distribution method is defined in the distribution object.
  if (Object.hasOwn(distribution, layer.style?.theme?.distribution)) {
    const theme = layer.style.theme;

    // Call the corresponding distribution function.
    await distribution[theme.distribution](layer);

    processedThemes.set(layer, theme);

    layer.L.changed();

    // The legend method renders into the layer.style.legend
    mapp.ui.layers.drawLegend(layer);
  }
}

/**
@function distributionReady

@description
The distributionReady method checks whether the legend for the current layer theme can be drawn.

A theme without a data distribution can always be drawn. A theme with a data distribution can only be drawn once its distribution has been processed from the current layer data. The legend of such a theme is drawn by the process method once the data has been received.

@param {layer} layer A decorated mapp layer object.
@property {Object} [style.theme] The current theme.
@property {string} [theme.distribution] The key of a featureFields distribution method.

@returns {Boolean} The legend for the current theme can be drawn.
*/
export function distributionReady(layer) {
  const theme = layer.style?.theme;

  if (!Object.hasOwn(distribution, theme?.distribution)) return true;

  return processedThemes.get(layer) === theme;
}

export const distribution = {
  count,
  jenks,
};

/**
@function jenks

@description
The jenks distribution method requires the stats.jenks utility method to calculate natural breaks within the `featureFields.values[]` array.

@param {layer} layer A decorated mapp layer object.
*/
async function jenks(layer) {
  const theme = layer.style.theme;

  const n = Math.min(
    layer.featureFields[theme.field].values.length,
    theme.categories.length,
  );

  // Parse array values as float.
  layer.featureFields[theme.field].values = layer.featureFields[
    theme.field
  ].values
    .filter((val) => val !== null)
    .map(Number.parseFloat);

  const simpleStatistics = await mapp.utils.simpleStatistics();

  // Compute Jenks natural breaks.
  layer.featureFields[theme.field].jenks = simpleStatistics.jenks(
    layer.featureFields[theme.field].values,
    n,
  );

  let value;

  theme.categories.forEach((cat, i) => {
    value =
      value === layer.featureFields[theme.field].jenks[i]
        ? undefined
        : layer.featureFields[theme.field].jenks[i];

    cat.value = value;

    // Format category label using numeric formatter utility.
    // legend object is passed as part of the params, such as suffix, prefix, round.
    // see numericFormatter.mjs for notes on params available.
    cat.label = mapp.utils.formatNumericValue({
      ...theme.legend,
      value,
    });
  });
}

/**
@function count

@description
The count distribution method counts values in the `featureFields.values[]` array.

@param {layer} layer A decorated mapp layer object.
*/
function count(layer) {
  const theme = layer.style.theme;

  if (Array.isArray(theme.fields)) {
    theme.fields.forEach((field) => {
      layer.featureFields[field].values.forEach((val) => {
        // Increment count for each value.
        layer.featureFields[field][val] ??= 0;
        layer.featureFields[field][val]++;
      });
    });
  } else if (theme.field) {
    layer.featureFields[theme.field].values.forEach((val) => {
      // Increment count for each value.
      layer.featureFields[theme.field][val] ??= 0;
      layer.featureFields[theme.field][val]++;
    });
  }
}

/**
@function fieldsArray

@description
The fieldsArray method checks the layer params and style to create a Set of fields which are required as feature properties.

An array without duplicates or undefined fields is returned from the Set.

@param {layer} layer A decorated mapp vector layer.
@returns {array} Array of feature fields.
*/
export function fieldsArray(layer) {
  const fieldsSet = new Set([
    layer.params.default_fields,
    layer.style.theme?.field,
    layer.style.label?.field,
    layer.style.hover?.field,
    layer.style.icon_scaling?.field,
    layer.cluster?.label,
  ]);

  if (Array.isArray(layer.style.theme?.fields)) {
    layer.style.theme.fields.forEach(fieldsSet.add, fieldsSet);
  }

  return Array.from(fieldsSet)
    .flat()
    .filter((field) => !!field);
}
