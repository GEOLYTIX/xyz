export default _xyz => {

  return {
    toggle: toggle
  };

  function toggle() {

    _xyz.mapview.locate.active = !_xyz.mapview.locate.active;

    let flyTo = true;

    // Create the geolocation marker if it doesn't exist yet.
    if (!_xyz.mapview.locate.L) {
      _xyz.mapview.locate.L = _xyz.L.marker([0, 0], {
        interactive: false,
        icon: _xyz.L.icon({
          iconUrl: _xyz.utils.svg_symbols({type: 'geo'}),
          iconSize: 30
        })
      });
    }

    // Remove the geolocation marker if _xyz.mapview.locate is not active.
    if (!_xyz.mapview.locate.active) return _xyz.map.removeLayer(_xyz.mapview.locate.L);
        
    // Add the geolocation marker if the latitude is not 0.
    if (_xyz.mapview.locate.L.getLatLng().lat !== 0) {
      _xyz.mapview.locate.L.addTo(_xyz.map);

      // Fly to marker location and set flyto to false to prevent map tracking.
      if (flyTo) _xyz.map.flyTo(
        _xyz.mapview.locate.L.getLatLng(),
        _xyz.workspace.locale.maxZoom);

      flyTo = false;
    }

    // Create a geolocation watcher if it doesn't exist
    if (!_xyz.mapview.locate.watcher) {
      _xyz.mapview.locate.watcher = navigator.geolocation.watchPosition(
        pos => {
          
        // Log position.
          if (_xyz.log) console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
          // Reposition marker if _xyz.mapview.locate is active
          if (_xyz.mapview.locate.active) {
            let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
            _xyz.map.removeLayer(_xyz.mapview.locate.L);
            _xyz.mapview.locate.L.setLatLng(pos_ll);
            _xyz.mapview.locate.L.addTo(_xyz.map);

            // Fly to pos_ll and set flyTo to false to prevent map tracking.
            if (flyTo) _xyz.map.flyTo(pos_ll, _xyz.workspace.locale.maxZoom);
            flyTo = false;
          }
        },
        err => { console.error(err); },
        // optional parameter for navigator.geolocation
        {
        //enableHighAccuracy: false,
        //timeout: 3000,
        //maximumAge: 0
        }
      );
    }
  };

};