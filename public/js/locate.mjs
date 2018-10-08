import _xyz from './_xyz.mjs';

import L from 'leaflet';

export default () => {

  let btnLocate = document.getElementById('btnLocate');

  btnLocate.addEventListener('click', e => {
    btnLocate.classList.toggle('active');

    let flyTo = true;

    // Create the geolocation marker if it doesn't exist yet.
    if (!_xyz.ws.locate.L) {
      _xyz.ws.locate.L = L.marker([0, 0], {
        interactive: false,
        icon: L.icon({
          iconUrl: _xyz.utils.svg_symbols({type: 'geo'}),
          iconSize: 30
        })
      });
    }

    // Remove the geolocation marker if btnLocate is not active.
    if (!btnLocate.classList.contains('active')) {
      _xyz.map.removeLayer(_xyz.ws.locate.L);
      return;
    }
        
    // Add the geolocation marker if btnLocate is active and the latitude is not 0.
    if (btnLocate.classList.contains('active') && _xyz.ws.locate.L.getLatLng().lat !== 0) {
      _xyz.ws.locate.L.addTo(_xyz.map);

      // Fly to marker location and set flyto to false to prevent map tracking.
      if (flyTo) _xyz.map.flyTo(
        _xyz.ws.locate.L.getLatLng(),
        _xyz.ws.locales[_xyz.locale].maxZoom);

      flyTo = false;
    }

    // Create a geolocation watcher if it doesn't exist
    if (!_xyz.ws.locate.watcher) {
      _xyz.ws.locate.watcher = navigator.geolocation.watchPosition(
        pos => {
          //console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
          // Change icon to fixed location.
          btnLocate.children[0].textContent = 'gps_fixed';

          // Reposition marker if btnLocate is active
          if (btnLocate.classList.contains('active')) {
            let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
            _xyz.map.removeLayer(_xyz.ws.locate.L);
            _xyz.ws.locate.L.setLatLng(pos_ll);
            _xyz.ws.locate.L.addTo(_xyz.map);

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