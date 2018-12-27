// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }


_xyz.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map',
  locale: 'GB',
  view_lat: 52,
  view_lng: 0,
  view_zoom: 12,
  next: init
});

function init() {

  // let layer = _xyz.layers.list['grid'];
  // layer.display = true;
  // layer.get();

  // let layer = _xyz.layers.list['oa'];
  // layer.style.theme = layer.style.themes['Population \'11'];
  // layer.loaded = false;
  // layer.get();

  //_xyz.locate.toggle();

}

