/**
## mapp.utils.polygonIntersectFeatures()

@module /utils/polygonIntersectFeatures
*/

/**
 * Checks if features intersect with a drawn polygon on a map view.
 * @function polygonIntersectFeatures
 * @param {Object} params - The parameters for the function.
 * @param {Object} params.mapview - The map view instance.
 * @param {Function} [params.drawendCallback] - Callback function to be called with intersecting features.
 * @param {Object} [params.interaction] - Additional interaction options to be merged with the default config.
 */
export function polygonIntersectFeatures(params) {
  if (!params.mapview) return;

  function getArrayDepth(arr) {
    return Array.isArray(arr) ? 1 + Math.max(0, ...arr.map(getArrayDepth)) : 0;
  }

  // Config for mapview draw interaction.
  const interaction = {
    // Draw polygon.
    drawend: (e) => {
      const poly = e.feature;

      const polyGeom = poly.getGeometry();

      let features = params.mapview.interaction.snap.source.getFeatures();

      features = features.filter((feature) => {
        let coordinates = feature.getGeometry().getCoordinates(); //.flat(2)

        coordinates = coordinates.flat(getArrayDepth(coordinates) - 2);

        return coordinates.some((coord) =>
          polyGeom.intersectsCoordinate(coord),
        );
      });

      if (params.drawendCallback) {
        params.drawendCallback(features);
      }
    },

    type: 'Polygon',
    ...params,
  };

  // Initiate drawing on mapview with config as interaction argument.
  params.mapview.interactions.draw(interaction);
}
