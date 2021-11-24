import kinks from '@turf/kinks'

export default mapview => function(coordinates, geometry){

  if (!geometry) {
    geometry = new ol.geom.Polygon(coordinates);
  } 

  const _kinks = kinks({
    type: 'Polygon',
    coordinates: geometry.getCoordinates()
  }).features

  if (coordinates[0].length) {   

    // Add a closing coordinate for polygon geometry.
    geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])])
  }

  mapview.interaction.current.kinks = _kinks.length > 0 && _kinks[0].geometry.coordinates.join() !== coordinates[0][0].join()

  mapview.node.style.cursor = mapview.interaction.current.kinks ? 'not-allowed' : 'crosshair';

  return geometry
}