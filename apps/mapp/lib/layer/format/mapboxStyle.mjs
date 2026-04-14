/**
### /layer/formats/mapboxStyle

The mapboxStyle layer format requires the ol-mapbox-style plugin for the native display of mapbox style tile layer in Openlayers.

The plugin is loaded from a script tag through the scriptElement utility method.

CSP access to `cdn.jsdelivr.net` is required in order to import the ol-mapbox-style plugin.

@requires ol-mapbox-style
@requires /utils/scriptElement

@module /layer/formats/mapboxStyle
*/

/**
@function mapboxStyle

@description
The mapboxStyle method creates an Openlayers VectorTile layer and assigns a mapbox style through the ol-mapbox-style plugin.

@param {layer} layer JSON layer
@property {Object} layer.style
@property {string} style.URL The location of a mvt stylesheet.
@property {string} layer.accessToken An accessToken is required to access tiles and stylesheets from the Mapbox API.

@returns {layer} layer decorated with format methods.
*/
export default async function mapboxStyle(layer) {
  await mapp.utils.scriptElement(
    'https://cdn.jsdelivr.net/npm/ol-mapbox-style@13.0.1/dist/olms.js',
  );

  layer.L = new ol.layer.VectorTile({
    declutter: true,
    zIndex: layer.zIndex,
  });

  olms.applyStyle(layer.L, layer.style.URL, { accessToken: layer.accessToken });
}
