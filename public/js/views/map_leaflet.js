// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }

_xyz1 = _xyz();

_xyz1.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'NE',
  scrollWheelZoom: true,
  view_lat: 40.74,
  view_lng: -73.98,
  view_zoom: 10,
  btnZoomIn: document.getElementById('btnZoomIn1'),
  btnZoomOut: document.getElementById('btnZoomOut1'),
  callback: PopTheme
});

function PopTheme(){

  _xyz1.layers.list.OSM.remove();

  _xyz1.layers.list.COUNTRIES.style.theme = _xyz1.layers.list.COUNTRIES.style.themes['Population'];
  _xyz1.layers.list.COUNTRIES.loaded = false;
  _xyz1.layers.list.COUNTRIES.get();
}

_xyz2 = _xyz();

_xyz2.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'GB',
  view_lat: 51.52,
  view_lng: 0.24,
  view_zoom: 10,
  btnZoomIn: document.getElementById('btnZoomIn2'),
  btnZoomOut: document.getElementById('btnZoomOut2'),
  callback: Grid
});

function LocatePopup(){

  _xyz2.locate.toggle();

  _xyz2.locations.select_output = location => {
    document.getElementById('location_info_container').innerHTML = location.infoj[1].value;
  };

  // _xyz2.locations.select_popup = location => {
  //   let container = document.getElementById('location_info_container');
  //   container.innerHTML = '';
  //   container.appendChild(location.info_table);
  // };
}


function Grid() {

  _xyz2.layers.list.grid.show();

  _xyz2.layers.list.retail_points.remove();

}