/**
## Mapview.getBounds()
Returns an object representing bounds

@module /mapview/getBounds

@param {string} srid
Optional spatial reference identifier as string.

@returns {{south: number, west: number, north: number, east: number}}
Bounds object
*/

export default function (srid) {
  /**

   */

  const extent = this.Map.getView().calculateExtent();

  if (!srid)
    return {
      east: extent[2],
      north: extent[3],
      south: extent[1],
      west: extent[0],
    };

  // transforms extent from source projection to destination projection
  const extentTransformed = ol.proj.transformExtent(
    extent,
    `EPSG:${this.srid}`,
    `EPSG:${srid}`,
  );

  return {
    east: extentTransformed[2],
    north: extentTransformed[3],
    south: extentTransformed[1],
    west: extentTransformed[0],
  };
}
