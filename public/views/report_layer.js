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
    target: document.getElementById('report_map'),
    view: {
      lat: params.lat,
      lng: params.lng,
      z: params.z
    }
  });

  const layer = _xyz.layers.list[params.layer];

  layer.show();

  if (layer.style.theme) {

    document.getElementById('report_left').appendChild(_xyz.layers.view.style.legend(layer));

  }

   _xyz.dataview.layerTable({
     layer: layer,
     target_id: 'report_table',
     key: 'Retail Places'
   });

}