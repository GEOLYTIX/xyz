/**
## mapp.utils.verticeGeoms()

@module /utils/verticeGeoms
*/

export default (feature) => {
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
};

function getDepth(arr) {
  return Array.isArray(arr) ? 1 + Math.max(0, ...arr.map(getDepth)) : 0;
}
