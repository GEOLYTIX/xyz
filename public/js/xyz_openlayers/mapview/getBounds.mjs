export default _xyz => function(srid){

  const extent = _xyz.map.getView().calculateExtent();

  if (!srid) return {
    south: extent[1],
    west: extent[0],
    north: extent[3],
    east: extent[2],
  };

  const extent_transformed = _xyz.mapview.lib.proj.transformExtent(
    extent,
    'EPSG:' + _xyz.mapview.srid,
    'EPSG:' + srid);

  return {
    south: extent_transformed[1],
    west: extent_transformed[0],
    north: extent_transformed[3],
    east: extent_transformed[2],
  };

};