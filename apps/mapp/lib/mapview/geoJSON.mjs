/**
## Mapview.geoJSON()
The mapview.geojson method creates and adds a geoJSON layer/source to the mapview.Map.

@module /mapview/geoJSON

@param {Object} params
The params object argument.
*/

export default function (params) {
  params.format = 'GeoJSON';

  return this.geometry(params);
}
