const params = {};

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
  params[key] = decodeURI(value);
});

window.onload = () => {

  _xyz({
    host: '/mab',
    locale: params.locale,
    callback: init
  })

  _xyz({
    host: '/mab',
    locale: params.locale,
    callback: initSatelliteMap
  }) 
}



function init(_xyz) {

  _xyz.mapview.create({
    scrollWheelZoom: true,
    target: document.getElementById('xyz_map')
  });

  _xyz.layers.load(["Mapbox Colour", params.layer]).then(layers => {

    layers.forEach(layer => layer.show())

    _xyz.locations.select({
      locale: params.locale,
      layer: _xyz.layers.list[params.layer],
      table: _xyz.layers.list[params.layer].table,
      id: params.id,
      callback: location => {

        _xyz.locations.decorate(location);

        location.marker = _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;

        location.infoj = location.infoj.filter(entry => !entry.plugin);

        _xyz.locations.view.create(location)

        location.draw()

        location.flyTo()

        location.layer.show()

        // Draw location marker.
        location.Marker = _xyz.mapview.geoJSON({
          geometry: {
            type: 'Point',
            coordinates: location.marker,
          },
          style: new ol.style.Style({
            image: _xyz.mapview.icon({
              type: 'markerColor',
              colorMarker: '#1F964D',
              colorDot: '#fff',
              scale: 2,
              anchor: [0.5, 1]
            })
          }),
          dataProjection: location.layer.srid,
          featureProjection: _xyz.mapview.srid
        })

        document.getElementById('xyz_location') && document.getElementById('xyz_location').appendChild(_xyz.locations.view.infoj(location));
      }})
  })
}

function initSatelliteMap(_xyz){

  if(!document.getElementById('xyz_satellite_map')) return;

  _xyz.mapview.create({
    scrollWheelZoom: true,
    target: document.getElementById('xyz_satellite_map')
  })

  _xyz.layers.load(["HERE Imagery", params.layer]).then(layers => {
    layers.forEach(layer => layer.show())

    _xyz.locations.select({
      locale: params.locale,
      layer: _xyz.layers.list[params.layer],
      table: _xyz.layers.list[params.layer].table,
      id: params.id,
      callback: location => {

        location.infoj = location.infoj.filter(entry => !(entry.type === 'dataview') || entry.plugin)

        location.marker = _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates

        _xyz.locations.view.create(location)

        location.draw()

        location.flyTo()

        // Draw location marker.
        location.Marker = _xyz.mapview.geoJSON({
          geometry: {
            type: 'Point',
            coordinates: location.marker,
          },
          style: new ol.style.Style({
            image: _xyz.mapview.icon({
              type: 'markerColor',
              colorMarker: '#1F964D',
              colorDot: '#fff',
              scale: 2,
              anchor: [0.5, 1]
            })
          }),
          dataProjection: location.layer.srid,
          featureProjection: _xyz.mapview.srid
      })

      }
    })
  })
}
