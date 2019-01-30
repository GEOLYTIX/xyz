// if ( window.history.replaceState ) {
//   window.history.replaceState( null, null, window.location.href );
// }

// _xyz().init({
//   host: document.head.dataset.dir,
//   //token: API token,
//   map_id: 'xyz_map1',
//   locale: 'GB',
//   scrollWheelZoom: true,
//   view: {
//     lat: 51.52,
//     lng: 0.24,
//     z: 12,
//   },
//   btnZoomIn: document.getElementById('btnZoomIn1'),
//   btnZoomOut: document.getElementById('btnZoomOut1'),
//   callback: Grid
// });

_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map1',
  locale: 'NE',
  btnZoomIn: document.getElementById('btnZoomIn1'),
  btnZoomOut: document.getElementById('btnZoomOut1'),
  callback: mvt_select
});

_xyz().init({
  host: document.head.dataset.dir,
  //token: API token,
  map_id: 'xyz_map2',
  locale: 'NE',
  btnZoomIn: document.getElementById('btnZoomIn2'),
  btnZoomOut: document.getElementById('btnZoomOut2'),
  callback: TableView
});

function LocatePopup(_xyz){

  _xyz.locate.toggle();

  _xyz2.locations.select_popup = location => {
    let container = document.getElementById('location_info_container');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  };

}


function Grid(_xyz) {

  _xyz.layers.list.grid.grid_size = 'gen_female__11';
  
  _xyz.layers.list.grid.grid_color = 'gen_male__11';
  
  _xyz.layers.list.grid.grid_ratio = true;

  _xyz.layers.list.grid.show();

  _xyz.layers.list.grid.style.setLegend(document.getElementById('location_info_container1'));

}

function Legends(_xyz) {

  _xyz.layers.list.retail_points.style.setTheme('Retailer');

  // _xyz.layers.list.retail_points.style.setLegend(document.getElementById('location_info_container2'));

  // _xyz.layers.list.oa.style.setTheme('Population \'11');

  // _xyz.layers.list.oa.style.setLegend(document.getElementById('location_info_container2'));

  _xyz.locations.select_popup = location => {

    let container = document.getElementById('location_info_container2');

    container.innerHTML = '';

    container.appendChild(location.info_table);

  };

}

function Offices(_xyz) {

  _xyz.layers.list.offices.singleSelectOnly = true;

  _xyz.layers.list.offices.show();

  _xyz.locations.select_output = location => {
    document.getElementById('location_info_container1').innerHTML = location.infoj[1].value;
  };

}

function Offices2(_xyz) {

  _xyz.layers.list.offices.show();

  _xyz.locations.select_output = location => {
    document.getElementById('location_info_container2').innerHTML = location.infoj[1].value;
  };

}

function TableView(_xyz) {

  _xyz.layers.list['Mapbox Base'].remove();

  _xyz.layers.list.COUNTRIES.style.theme = null;

  _xyz.layers.list.COUNTRIES.show();

  _xyz.tableview.createTable({
    layer: _xyz.layers.list.COUNTRIES,
    target: document.getElementById('xyz_table1')
  });

  // Augment viewChangeEnd method to update table.
  _xyz.viewChangeEnd = _xyz.utils.compose(_xyz.viewChangeEnd, () => {
    _xyz.tableview.updateTable();
  });

  _xyz.locations.select_popup = location => {

    let container = document.getElementById('location_info_container2');

    container.innerHTML = '';

    container.appendChild(location.info_table);

    _xyz.layers.list.COUNTRIES.tableView.table.getRows()
      .filter(row => row.getData().name === location.infoj[0].value)
      .forEach(row => row.toggleSelect());

  };

}

function mvt_select(_xyz) {

  _xyz.layers.list.COUNTRIES.style.theme = null;

  _xyz.layers.list.COUNTRIES.show();

  _xyz.locations.select_popup = location => {

    let container = document.getElementById('location_info_container1');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  
  };

}

function mvt_select2(_xyz) {

  _xyz.layers.list.COUNTRIES.singleSelectOnly = true;

  _xyz.layers.list.COUNTRIES.style.theme = null;

  _xyz.layers.list.COUNTRIES.show();

  _xyz.locations.select_popup = location => {

    let container = document.getElementById('location_info_container2');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  
  };

}