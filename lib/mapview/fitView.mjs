/**
## Mapview.fitView()
Fits the view to a given extent

@module /mapview/fitView
@param {Array} extent - geo extent, array of 4 numbers, must be [minX, minY, maxX, maxY]
@param {Object} options - Defaults to empty object 
*/

export default function (extent, options = {}) {
  // Extent must be an array of finite values.
  if (!Array.isArray(extent) || !extent.every((val) => isFinite(val))) {
    console.warn('Attempted to call fitView method with invalid extent');
    return;
  }

  this.Map.getView().fit(extent, {
    duration: 1000,
    padding: [50, 50, 50, 50],
    ...options,
  });
}
