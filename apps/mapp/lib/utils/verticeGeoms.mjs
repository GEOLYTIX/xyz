/**
## mapp.utils.verticeGeoms()

@module /utils/verticeGeoms
*/

/**
@function verticeGeoms

@description
Returns a geometry with the vertices of the feature geometry. A Point returns a Point, every other geometry returns a MultiPoint.

The vertices are selected by the geometry type:
- A MultiPoint or LineString returns all its coordinates.
- A MultiLineString returns the vertices of all its lines.
- A Polygon returns the vertices of its exterior and interior rings.
- A MultiPolygon returns the vertices of all rings of all its polygons.

@param {ol.Feature} feature An Openlayers feature.
@returns {ol.geom.Point|ol.geom.MultiPoint} The vertices geometry.
*/
export default function verticeGeoms(feature) {
  const geometry = feature.getGeometry();

  const coords = geometry.getCoordinates();

  switch (geometry.getType()) {
    case 'Point':
      return new ol.geom.Point(coords);

    // Coordinates are already an array of vertices.
    case 'MultiPoint':
    case 'LineString':
      return new ol.geom.MultiPoint(coords);

    // Flatten the lines or rings into a single array of vertices.
    case 'MultiLineString':
    case 'Polygon':
      return new ol.geom.MultiPoint(coords.flat(1));

    // Flatten the rings of all polygons into a single array of vertices.
    case 'MultiPolygon':
      return new ol.geom.MultiPoint(coords.flat(2));
  }
}
