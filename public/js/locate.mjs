import _xyz from './_xyz.mjs';

export default () => {

  _xyz.locate.toggle = document.getElementById('btnLocate');

  _xyz.locate.toggle.addEventListener('click', () => {

    _xyz.locate.toggle.classList.toggle('active');

    let flyTo = true;

    // Create the geolocation marker if it doesn't exist yet.
    if (!_xyz.locate.L) {
      _xyz.locate.L = _xyz.L.marker([0, 0], {
        interactive: false,
        icon: _xyz.L.icon({
          iconUrl: _xyz.utils.svg_symbols({type: 'geo'}),
          iconSize: 30
        })
      });
    }

    // Remove the geolocation marker if _xyz.locate.toggle is not active.
    if (!_xyz.locate.toggle.classList.contains('active')) {
      _xyz.map.removeLayer(_xyz.locate.L);
      return;
    }
        
    // Add the geolocation marker if _xyz.locate.toggle is active and the latitude is not 0.
    if (_xyz.locate.toggle.classList.contains('active') && _xyz.locate.L.getLatLng().lat !== 0) {
      _xyz.locate.L.addTo(_xyz.map);

      // Fly to marker location and set flyto to false to prevent map tracking.
      if (flyTo) _xyz.map.flyTo(
        _xyz.locate.L.getLatLng(),
        _xyz.ws.locales[_xyz.locale].maxZoom);

      flyTo = false;
    }

    // Create a geolocation watcher if it doesn't exist
    if (!_xyz.locate.watcher) {
      _xyz.locate.watcher = navigator.geolocation.watchPosition(
        pos => {
          
          // Log position.
          if (_xyz.log) console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
          // Change icon to fixed location.
          _xyz.locate.toggle.children[0].textContent = 'gps_fixed';

          // Reposition marker if _xyz.locate.toggle is active
          if (_xyz.locate.toggle.classList.contains('active')) {
            let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
            _xyz.map.removeLayer(_xyz.locate.L);
            _xyz.locate.L.setLatLng(pos_ll);
            _xyz.locate.L.addTo(_xyz.map);

            // Fly to pos_ll and set flyTo to false to prevent map tracking.
            if (flyTo) _xyz.map.flyTo(pos_ll, _xyz.ws.locales[_xyz.locale].maxZoom);
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
  });
  
};