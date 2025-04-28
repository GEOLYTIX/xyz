/**
Exports the default locationCount utility method as mapp.ui.utils.locationCount().

@module ui/utils/locationCount
*/

/**
@function locationCount

@description
Returns a number representing the amount of locations that pass the filter.

@param {layer} layer
@property {String} layer.key The layers' identifier.
@property {Object} layer.filter The filter currently active on the layer.
@property {Object} layer.mapview The mapview associated to the layer.
@property {Object} [layer.queryparams] The query parameters that are being used on the layer.

@returns {Integer} The number of locations that pass the filter.
*/
export default async function locationCount(layer) {
  //Whether or not to use the viewport in the query
  const options = {
    layer: layer,
    queryparams: {},
  };

  options.viewport = layer.filter?.viewport || layer.queryparams?.viewport;

  const params = mapp.utils.queryParams(options);

  const paramString = mapp.utils.paramString({
    ...params,
    filter: layer.filter?.current,
    layer: layer.key,
    table: layer.tableCurrent(),
    template: 'location_count',
  });

  const feature_count = await mapp.utils.xhr(
    `${layer.mapview.host}/api/query?${paramString}`,
  );

  return feature_count;
}
