export default _xyz => {

  const locate = {

    toggle: toggle,

    active: false,

    icon: {
      type: 'geo',
      scale: 0.05
    },

    marker: new _xyz.mapview.lib.Feature({
      geometry: new _xyz.mapview.lib.geom.Point([0, 0])
    })

  };

  return locate;

  function toggle() {

    locate.active = !locate.active;

    let flyTo = true;

    // Create the geolocation marker if it doesn't exist yet.
    if (!locate.L) {

      locate.L = new _xyz.mapview.lib.layer.Vector({
        source: new _xyz.mapview.lib.source.Vector({
          features: [locate.marker]
        }),
        zIndex: 40,
        style: new _xyz.mapview.lib.style.Style({
          image: _xyz.mapview.icon(_xyz.mapview.locate.icon)
        })
      });
     
    }

    // Remove the geolocation marker if locate is not active.
    if (!locate.active) return _xyz.map.removeLayer(locate.L);

    _xyz.map.addLayer(locate.L);

  
    // Create a geolocation watcher if it doesn't exist
    if (!locate.watcher) {

      locate.watcher = navigator.geolocation.watchPosition(pos => {
          
        // Log position.
        if (_xyz.log) console.log('pos: ' + [parseFloat(pos.coords.latitude), parseFloat(pos.coords.longitude)]);
                    
        // Reposition marker if locate is active
        if (locate.active) {

          const coords = _xyz.mapview.lib.proj.fromLonLat([
            parseFloat(pos.coords.longitude),
            parseFloat(pos.coords.latitude)
          ]);

          locate.marker.getGeometry().setCoordinates(coords);

          // Fly to pos_ll and set flyTo to false to prevent map tracking.
          if (flyTo) _xyz.map.getView().animate(
            { center:  coords },
            { zoom: _xyz.workspace.locale.maxZoom }
          );

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