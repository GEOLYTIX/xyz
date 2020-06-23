export default _xyz => {

  const locate = {

    toggle: toggle,

    active: false,

    icon: {
      type: 'geo',
      scale: 0.05
    },

    marker: new ol.Feature({
      geometry: new ol.geom.Point([0, 0])
    })

  };

  return locate;

  function toggle() {

    locate.active = !locate.active;

    let flyTo = true;

    // Create the geolocation marker if it doesn't exist yet.
    if (!locate.L) {

      locate.L = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [locate.marker]
        }),
        zIndex: 40,
        style: new ol.style.Style({
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
                    
        // Reposition marker if locate is active
        if (locate.active) {

          const coords = ol.proj.fromLonLat([
            parseFloat(pos.coords.longitude),
            parseFloat(pos.coords.latitude)
          ]);

          locate.marker.getGeometry().setCoordinates(coords);

          // Fly to pos_ll and set flyTo to false to prevent map tracking.
          if (flyTo) _xyz.map.getView().animate(
            { center:  coords },
            { zoom: _xyz.locale.maxZoom }
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