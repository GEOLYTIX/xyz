export default _xyz => function () {

  const location = this;

  if (_xyz.hooks) _xyz.hooks.filter('locations', location.hook);


  // Clear geometries and delete location to free up record.
  // location.geometries.forEach(
  //   geom => _xyz.map.removeLayer(geom)
  // );

  if (location.Layer) _xyz.map.removeLayer(location.Layer);

  // if (location.Marker) _xyz.map.removeLayer(location.Marker);

  // location.tables.forEach(
  //   table => _xyz.tableview.removeTab(table)
  // );
    
};