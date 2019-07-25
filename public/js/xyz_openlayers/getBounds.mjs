export default _xyz => function(epsg){

  const extent = _xyz.map.getView().calculateExtent();

  if (!epsg || epsg === '3857') return {
    south: extent[1],
    west: extent[0],
    north: extent[3],
    east: extent[2],
  };

  const extent_transformed = _xyz.mapview.lib.proj.transformExtent(extent,'EPSG:3857','EPSG:'+epsg);

  return {
    south: extent_transformed[1],
    west: extent_transformed[0],
    north: extent_transformed[3],
    east: extent_transformed[2],
  };

};