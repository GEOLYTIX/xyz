export default _xyz => {

  const locate = {

    toggle: toggle,

    active: false,

    marker: new _xyz.mapview.lib.ol.Feature({
      geometry: new _xyz.mapview.lib.ol.geom.Point([0, 0])
    })

  };

  return locate;

  function toggle() {

    locate.active = !locate.active;

    let flyTo = true;

    // Create the geolocation marker if it doesn't exist yet.
    if (!locate.L) {

      locate.L = new _xyz.mapview.lib.ol.layer.Vector({
        source: new _xyz.mapview.lib.ol.source.Vector({
          features: [locate.marker]
        }),
        zIndex: 40,
        style: new _xyz.mapview.lib.ol.style.Style({
          image: _xyz.mapview.lib.icon({
            url: _xyz.utils.svg_symbols({type: 'geo'}),
            iconSize: 30
          })
        })
      });

      _xyz.map.addLayer(locate.L);
      
    }

    // Remove the geolocation marker if locate is not active.
    if (!locate.active) return _xyz.map.removeLayer(locate.L);

    
    // // Add the geolocation marker if the latitude is not 0.
    // if (locate.L.getLatLng().lat !== 0) {

    //   _xyz.map.addLayer(layer.L);

    //   // Fly to marker location and set flyto to false to prevent map tracking.
    //   //if (flyTo) _xyz.map.flyTo(locate.L.getLatLng(), _xyz.workspace.locale.maxZoom);

    //   flyTo = false;
    // }

    // Create a geolocation watcher if it doesn't exist
    if (!locate.watcher) {
      locate.watcher = navigator.geolocation.watchPosition(pos => {
          
        // Log position.
        if (_xyz.log) console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
        // Reposition marker if locate is active
        if (locate.active) {
          //const pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
          //_xyz.map.removeLayer(locate.L);
          //locate.L.setLatLng(pos_ll);
          //locate.L.addTo(_xyz.map);

          // let pos_ll = [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)];
          // let pos_ol = _xyz.ol.proj.fromLonLat(pos_ll.reverse());

          locate.marker.getGeometry().setCoordinates(
            _xyz.mapview.lib.ol.proj.fromLonLat([
              parseFloat(pos.coords.longitude),
              parseFloat(pos.coords.latitude)
            ]));



          // Fly to pos_ll and set flyTo to false to prevent map tracking.
          //if (flyTo) _xyz.map.flyTo(pos_ll, _xyz.workspace.locale.maxZoom);
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