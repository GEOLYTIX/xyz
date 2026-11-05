/**
## Mapview.fitView()
Fits the view to a given extent

@module /mapview/fitView
*/

/**
@function fitView
@this mapview

@description
Fits the mapview.Map view to the extent. The extent must be an array of finite values, otherwise a warning is logged and the view doesn't change.

The view fit has a duration of 1000ms and a padding of 50px, which can be overwritten by the options.

@param {Array} extent The extent [minX, minY, maxX, maxY] in the mapview projection.
@param {Object} [options={}] The Openlayers view fit options.
*/
export default function fitView(extent, options = {}) {
  // Extent must be an array of finite values.
  if (
    !Array.isArray(extent) ||
    !extent.every((val) => Number.isFinite(Number(val)))
  ) {
    console.warn('Attempted to call fitView method with invalid extent');
    return;
  }

  this.Map.getView().fit(extent, {
    duration: 1000,
    padding: [50, 50, 50, 50],
    ...options,
  });
}
