const params = {};

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
  params[key] = decodeURI(value);
});

_xyz({
  host: document.head.dataset.dir,
  token: document.body.dataset.token,
  locale: params.locale,
  callback: init
});

function init(_xyz) {

  _xyz.mapview.create({
    scrollWheelZoom: true,
    target: document.getElementById('report_map')
  });

  const layer = _xyz.layers.list[params.layer];

  _xyz.locations.select({
    locale: params.locale,
    layer: layer,
    table: params.table,
    id: params.id,
    callback: location => {

      _xyz.locations.decorate(location);

      // Required for streetview fields.
      location.marker = _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;

      _xyz.locations.view.create(location);

      location.draw();

      location.flyTo();

      location.layer.show();

      // Draw location marker.
      location.Marker = _xyz.mapview.geoJSON({
          geometry: {
            type: 'Point',
            coordinates: location.marker,
          },
          style: new _xyz.mapview.lib.style.Style({
            image: _xyz.mapview.icon({
              type: 'markerColor',
              colorMarker: '#2E86AB',
              colorDot: '#FFF',
              scale: 0.05,
              anchor: [0.5, 1]
            })
          }),
          dataProjection: location.layer.srid,
          featureProjection: _xyz.mapview.srid
      });

      document.getElementById('report_left').appendChild(location.view);
    }
  });

}