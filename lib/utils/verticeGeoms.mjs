export default feature => {

  const geometry = feature.getGeometry()

  const coords = geometry.getCoordinates()

  const type = geometry.getType()

  if (!coords) return;

  if (type === 'Point') return new ol.geom.Point(geometry.getCoordinates())

  if (type === 'LineString') return new ol.geom.MultiPoint(geometry.getCoordinates())

  var coordinates = type === 'MultiPolygon' && geometry.getCoordinates()[0] || geometry.getCoordinates()

  var mp = new ol.geom.MultiPoint(coordinates[0])

  return mp
}