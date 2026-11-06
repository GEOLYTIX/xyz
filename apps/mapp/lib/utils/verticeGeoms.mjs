/**
## mapp.utils.verticeGeoms()

@module /utils/verticeGeoms
*/

/**
@function verticeGeoms

@description
Returns a geometry with the vertices of the feature geometry. A point returns a point, other geometries return a multipoint.

The vertices are selected by the depth of the geometry coordinates:
- A LineString or MultiPoint returns all vertices.
- A Polygon returns the vertices of the exterior ring. A MultiLineString has the same depth and returns the vertices of the first line only.
- A MultiPolygon returns the vertices of all rings, including interior rings.

@param {ol.Feature} feature An Openlayers feature.
@returns {ol.geom.Point|ol.geom.MultiPoint} The vertices geometry.
*/
export default function verticeGeoms(feature) {
  const geometry = feature.getGeometry();

  if (geometry.getType() === 'Point')
    return new ol.geom.Point(geometry.getCoordinates());

  let coords = geometry.getCoordinates();

  const depth = getDepth(coords);

  // Line string will have a depth of 2.
  if (depth === 2) {
    return new ol.geom.MultiPoint(coords);
  }

  // Coords with a depth of more than 3 indicate multi geoms.
  coords = depth > 3 ? coords.flat(2) : coords[0];

  return new ol.geom.MultiPoint(coords);
}

function getDepth(arr) {
  return Array.isArray(arr) ? 1 + Math.max(0, ...arr.map(getDepth)) : 0;
}
