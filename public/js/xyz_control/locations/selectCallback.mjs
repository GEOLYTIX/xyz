export default _xyz => location => {

  // Create location view.
  location.view();

  // Draw location to map.
  location.draw();
    
  // Create an alert with the locations infoj if mapview popup is not defined.
  if (!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
    
  if (_xyz.locations.listview.node) return _xyz.locations.listview.add(location);
    
  // Create mapview popup with the locations view node.
  _xyz.mapview.popup.create({
    xy: location.marker, //_xyz.mapview.lib.proj.transform(location.marker, 'EPSG:4326', 'EPSG:3857'),
    content: location.view.node
  });

};