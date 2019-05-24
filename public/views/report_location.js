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


  _xyz.locations.select({
    locale: params.locale,
    layer: params.layer,
    table: params.table,
    id: params.id
  },
  location => {

    // Required for streetview fields.
    location.marker = _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;

    location.view();

    location.draw();

    document.getElementById('report_left').appendChild(location.view.node);

  });

}