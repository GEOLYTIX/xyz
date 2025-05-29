/**
### /layer/formats/mapboxStyle

The module imports ol-mapbox-style plugin for the native display of mapbox style tile layer in Openlayers.

CSP access to `unpkg.com` is required in order to import the ol-mapbox-style plugin.

@requires ol-mapbox-style@12.6.1

@module /layer/formats/mapboxStyle
*/

import 'https://unpkg.com/ol-mapbox-style@12.6.1/dist/olms.js';

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
  layer.L = new ol.layer.VectorTile({ declutter: true });

  olms.applyStyle(layer.L, layer.style.URL, { accessToken: layer.accessToken });
}
