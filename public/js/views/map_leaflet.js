// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }

_xyz.init({
  host: document.head.dataset.dir,
  token: document.body.dataset.token,
  map_id: 'xyz_map',
  locale: 'NE',
  view_lat: 52,
  view_lng: 0,
  view_zoom: 7
});

