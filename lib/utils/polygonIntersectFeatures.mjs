/**
## mapp.utils.polygonIntersectFeatures()

@module /utils/polygonIntersectFeatures
*/

export function polygonIntersectFeatures(params) {

  if (!params.mapview) return;

  function getArrayDepth(arr) {
    return Array.isArray(arr) ?
      1 + Math.max(0, ...arr.map(getArrayDepth)) :
      0;
  }

  // Config for mapview draw interaction.
  let interaction = {

    // Draw polygon.
    type: 'Polygon',

    drawend: e => {

      const poly = e.feature

      const polyGeom = poly.getGeometry()

      let features = params.mapview.interaction.snap.source.getFeatures()

      features = features
        .filter(feature => {

          let coordinates = feature.getGeometry().getCoordinates()//.flat(2)

          coordinates = coordinates.flat(getArrayDepth(coordinates) - 2)

          return coordinates.some(coord => polyGeom.intersectsCoordinate(coord))
        })

      if (params.drawendCallback) {

        params.drawendCallback(features)
      }
    },
    ...params
  }

  // Initiate drawing on mapview with config as interaction argument.
  params.mapview.interactions.draw(interaction)
}