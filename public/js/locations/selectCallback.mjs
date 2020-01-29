export default _xyz => location => {

  // Create location view. 
  _xyz.locations.view.create(location);

  location.draw();

  // Draw location marker.
  location.Marker = _xyz.mapview.geoJSON({
    geometry: {
      type: 'Point',
      coordinates: location.marker,
    },
    zIndex: 2000,
    style: new _xyz.mapview.lib.style.Style({
      image: _xyz.mapview.icon({
        type: 'markerLetter',
        letter: String.fromCharCode(65 + _xyz.locations.list.indexOf(location.record)),
        color: location.style.strokeColor,
        scale: 0.05,
        anchor: [0.5, 1],
      })
    })
  });

  if (location._flyTo) location.flyTo();
    
  // Create an alert with the locations infoj if mapview popup is not defined.
  if (!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));

  // Add location to list view if initialised.
  if (_xyz.locations.listview.node) return _xyz.locations.listview.add(location);
    
  // Create mapview popup with the locations view node.
  _xyz.mapview.popup.create({
    coords: location.marker,
    content: location.view
  });

};