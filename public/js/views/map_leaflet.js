// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }

_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'GB',
  scrollWheelZoom: true,
  view: {
    lat: 51.52,
    lng: 0.24,
    zoom: 12,
  },
  btnZoomIn: document.getElementById('btnZoomIn1'),
  btnZoomOut: document.getElementById('btnZoomOut1'),
  callback: Grid
});

_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'GB',
  view: {
    lat: 51.52,
    lng: 0.24,
    zoom: 12,
  },
  btnZoomIn: document.getElementById('btnZoomIn2'),
  btnZoomOut: document.getElementById('btnZoomOut2'),
  callback: Legends
});

function LocatePopup(_xyz){

  _xyz.locate.toggle();

  _xyz.locations.select_output = location => {
    document.getElementById('location_info_container').innerHTML = location.infoj[1].value;
  };

  // _xyz2.locations.select_popup = location => {
  //   let container = document.getElementById('location_info_container');
  //   container.innerHTML = '';
  //   container.appendChild(location.info_table);
  // };
}


function Grid(_xyz) {

  _xyz.layers.list.oa.remove();

  _xyz.layers.list.retail_points.remove();

  _xyz.layers.list.grid.grid_size = 'gen_female__11';
  
  _xyz.layers.list.grid.grid_color = 'gen_male__11';
  
  _xyz.layers.list.grid.grid_ratio = true;

  _xyz.layers.list.grid.show();

  _xyz.layers.list.grid.style.setLegend(document.getElementById('location_info_container1'));

}

function Legends(_xyz) {

  _xyz.layers.list.retail_points.style.setTheme('Retailer');

  _xyz.layers.list.retail_points.style.setLegend(document.getElementById('location_info_container2'));

  _xyz.layers.list.oa.style.setTheme('Population \'11');

  _xyz.layers.list.oa.style.setLegend(document.getElementById('location_info_container2'));

}

function PopTheme(_xyz){

  _xyz.layers.list.OSM.remove();

  _xyz.layers.list.COUNTRIES.style.setTheme('Population');

}