export default function (extent, opt_options = {}){
  /**
   * Fits the view to a given extent
   * @param {Array} extent - geo extent, array of 4 numbers, must be [minX, minY, maxX, maxY]
   * @param {Object} opt_options - Defaults to empty object 
   */


  mapp.utils.merge(mapp.dictionaries, {
    en: {
      invalid_lat_long: 'Attempted to call fitView method with invalid extent'
    }
  })
  // Extent must be an array of finite values.
  if (!Array.isArray(extent) || !extent.every(val => isFinite(val))) {
    console.warn(mapp.dictionary.invalid_lat_long);
    alert(`${mapp.dictionary.invalid_lat_long}`);
    return;
  }

  this.Map.getView().fit(
    extent,
    Object.assign(
      {
        padding: [50, 50, 50, 50],
        duration: 1000
      },
      opt_options)
  )
}