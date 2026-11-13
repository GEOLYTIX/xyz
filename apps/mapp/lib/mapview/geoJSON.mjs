/**
## Mapview.geoJSON()
The mapview.geojson method creates and adds a geoJSON layer/source to the mapview.Map.

@module /mapview/geoJSON
*/

/**
@function geoJSON
@this mapview

@description
Calls the mapview.geometry method with the GeoJSON format.

@param {Object} params The params for the [mapview.geometry]{@link module:/mapview/geometry~geometry} method.
@returns {ol.layer.Vector} The vector layer added to the mapview.Map.
*/
export default function geoJSON(params) {
  params.format = 'GeoJSON';

  return this.geometry(params);
}
