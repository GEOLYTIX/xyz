// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }

_xyz1 = _xyz();

_xyz1.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'NE',
  view_lat: 40.74,
  view_lng: -73.98,
  view_zoom: 10,
  btnZoomIn: document.getElementById('btnZoomIn1'),
  btnZoomOut: document.getElementById('btnZoomOut1')
  //callback: () => console.log(_xyz1)
});

_xyz2 = _xyz();

_xyz2.init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'Offices',
  view_lat: 51.52,
  view_lng: 0.24,
  view_zoom: 10,
  btnZoomIn: document.getElementById('btnZoomIn2'),
  btnZoomOut: document.getElementById('btnZoomOut2'),
  callback: () => {
    _xyz2.locate.toggle();

    _xyz2.locations.select_output = location => {

      document.getElementById('location_info_container').innerHTML = location.infoj[1].value;

    };

    _xyz2.locations.select_popup = location => {

      let container = document.getElementById('location_info_container');

      container.innerHTML = '';

      container.appendChild(location.info_table);

    };
  }
});


// function init() {

//   let layer = _xyz.layers.list['grid'];
//   layer.display = true;
//   layer.get();

//   let layer = _xyz.layers.list['oa'];
//   layer.style.theme = layer.style.themes['Population \'11'];
//   layer.loaded = false;
//   layer.get();

//   _xyz.locate.toggle();

// }