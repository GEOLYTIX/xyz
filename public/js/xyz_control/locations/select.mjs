export default _xyz => (location, callback) => {

  if (!location) return;

  // Remove current location if it exists.
  if (_xyz.locations.current) _xyz.locations.current.remove();

  // Deselect location; Remove record from listview.
  if (
    _xyz.locations.listview && 
    _xyz.locations.listview.records && 
    _xyz.locations.listview.removeRecord(location)) return;


  // Assign prototype to location.
  Object.assign(location, _xyz.locations.location());


  // Get location data from backend and continue with callback.
  if (callback) return location.get(callback);


  // Get location data from backend and add location record to listview.
  if (_xyz.locations.listview.records) return location.get(_xyz.locations.listview.addRecord);


  // Default callback for location.get().
  location.get(location => {

    // Make the location current.
    // To be removed when a new location is selected.
    _xyz.locations.current = location;

    // Get location marker from pointOnFeature is not already defined in location object.
    location.marker = location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;

    // Create location view.
    _xyz.locations.view(location);

    // Draw location to map.
    location.draw();

    // Create an alert with the locations infoj if mapview popup is not defined or the location does not have marker.
    if(!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
  
    // Create mapview popup with the locations view node.
    _xyz.mapview.popup({
      latlng: [location.marker[1], location.marker[0]],
      content: location.view.node
    });
  });

};