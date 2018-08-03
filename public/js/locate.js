const L = require('leaflet');
const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = _xyz => {

    let btnLocate = document.getElementById('btnLocate');

    btnLocate.addEventListener('click', e => {
        utils.toggleClass(btnLocate, 'active');

        let flyTo = true;

        // Create the geolocation marker if it doesn't exist yet.
        if (!_xyz.locate.L) {
            _xyz.locate.L = L.marker([0, 0], {
                interactive: false,
                icon: L.icon({
                    iconUrl: svg_symbols.markerGeolocation(),
                    iconSize: 30
                })
            });
        }

        // Remove the geolocation marker if btnLocate is not active.
        if (!utils.hasClass(btnLocate, 'active')) {
            _xyz.map.removeLayer(_xyz.locate.L);
            return
        }
        
        // Add the geolocation marker if btnLocate is active and the latitude is not 0.
        if (utils.hasClass(btnLocate, 'active') && _xyz.locate.L.getLatLng().lat !== 0) {
            _xyz.locate.L.addTo(_xyz.map);

            // Fly to marker location and set flyto to false to prevent map tracking.
            if (flyTo) _xyz.map.flyTo(
                _xyz.locate.L.getLatLng(),
                _xyz.locales[_xyz.locale].maxZoom);

            flyTo = false;
        }

        // Create a geolocation watcher if it doesn't exist
        if (!_xyz.locate.watcher) {
            _xyz.locate.watcher = navigator.geolocation.watchPosition(
                pos => {
                    //console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
                    // Change icon to fixed location.
                    btnLocate.children[0].textContent = 'gps_fixed';

                    // Reposition marker if btnLocate is active
                    if (utils.hasClass(btnLocate, 'active')) {
                        let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
                        _xyz.map.removeLayer(_xyz.locate.L);
                        _xyz.locate.L.setLatLng(pos_ll);
                        _xyz.locate.L.addTo(_xyz.map);

                        // Fly to pos_ll and set flyTo to false to prevent map tracking.
                        if (flyTo) _xyz.map.flyTo(pos_ll, _xyz.locales[_xyz.locale].maxZoom);
                        flyTo = false;
                    }
                },
                err => { console.error(err) },
                // optional parameter for navigator.geolocation
                {
                    //enableHighAccuracy: false,
                    //timeout: 3000,
                    //maximumAge: 0
                }
            );
        }
    });
}