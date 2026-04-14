/**
## /mapview/getBounds
Exports a utility method which must be assigned to a mapview object.

@module /mapview/getBounds

@param {string} srid
Optional spatial reference identifier as string.

@returns {{south: number, west: number, north: number, east: number}}
Bounds object
*/

/**
@function getBounds

@description
The getBounds method is assigned to the mapview object [_this].

The extent of the mapview view[port] will be calculated and returned as an object with east, north, south, west float properties.

@param {string} [srid] The returned bounding box will be transformed to the coordinate system SRID.

@returns {object} Bounding box extent {east, north, south, west}
*/
export default function getBounds(srid) {
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
