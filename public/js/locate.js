const L = require('leaflet');
const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = () => {

    let btnLocate = document.getElementById('btnLocate');

    btnLocate.addEventListener('click', e => {
        utils.toggleClass(btnLocate, 'active');

        let flyTo = true;

        // Create the geolocation marker if it doesn't exist yet.
        if (!global._xyz.locate.L) {
            global._xyz.locate.L = L.marker([0, 0], {
                interactive: false,
                icon: L.icon({
                    iconUrl: svg_symbols.create({type: "geo"}),
                    iconSize: 30
                })
            });
        }

        // Remove the geolocation marker if btnLocate is not active.
        if (!utils.hasClass(btnLocate, 'active')) {
            global._xyz.map.removeLayer(global._xyz.locate.L);
            return
        }
        
        // Add the geolocation marker if btnLocate is active and the latitude is not 0.
        if (utils.hasClass(btnLocate, 'active') && global._xyz.locate.L.getLatLng().lat !== 0) {
            global._xyz.locate.L.addTo(global._xyz.map);

            // Fly to marker location and set flyto to false to prevent map tracking.
            if (flyTo) global._xyz.map.flyTo(
                global._xyz.locate.L.getLatLng(),
                global._xyz.locales[global._xyz.locale].maxZoom);

            flyTo = false;
        }

        // Create a geolocation watcher if it doesn't exist
        if (!global._xyz.locate.watcher) {
            global._xyz.locate.watcher = navigator.geolocation.watchPosition(
                pos => {
                    //console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
                    // Change icon to fixed location.
                    btnLocate.children[0].textContent = 'gps_fixed';

                    // Reposition marker if btnLocate is active
                    if (utils.hasClass(btnLocate, 'active')) {
                        let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
                        global._xyz.map.removeLayer(global._xyz.locate.L);
                        global._xyz.locate.L.setLatLng(pos_ll);
                        global._xyz.locate.L.addTo(global._xyz.map);

                        // Fly to pos_ll and set flyTo to false to prevent map tracking.
                        if (flyTo) global._xyz.map.flyTo(pos_ll, global._xyz.locales[global._xyz.locale].maxZoom);
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