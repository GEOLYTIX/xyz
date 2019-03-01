let
  Map1 = document.getElementById('xyz_map1'),
  Map2 = document.getElementById('xyz_map2'),
  Info1 = document.getElementById('location_info_container1'),
  Info2 = document.getElementById('location_info_container2'),
  Table1 = document.getElementById('xyz_table1');


(async () => {

  const xyz = await _xyz({
    // token: API token,
    //locale: 'GB',
    host: document.head.dataset.dir
  });
  
  // xyz.workspace.loadLocale({
  //   locale: 'GB'
  // });

  xyz.mapview.create({
    //locale: 'GB',
    target: Map1,
    scrollWheelZoom: true,
    view: {
      lat: 53,
      lng: -1,
      z: 8,
    },
    btn: {
      ZoomIn: document.getElementById('btnZoomIn1'),
      ZoomOut: document.getElementById('btnZoomOut1')
    }
  });
  
  // xyz.layers.list.retail_points.show();

  // xyz.mapview.locate.toggle();


})();



_xyz({
  // token: API token,
  host: document.head.dataset.dir,
  callback: Dev
});


function Dev(_xyz) {

  _xyz.mapview.create({
    target: Map2,
    view: {
      lat: 53,
      lng: -1,
      z: 6,
    },
    btn: {
      ZoomIn: document.getElementById('btnZoomIn2'),
      ZoomOut: document.getElementById('btnZoomOut2')
    }
  });

  // _xyz.tableview.layerTable({
  //   layer: _xyz.layers.list.COUNTRIES,
  //   key: 'table1',
  //   target: Table1
  // });

  _xyz.tableview.locationTable({
    title: 'Age Profile',
    location: {
      layer: 'report_test',
      id: 41
    },
    target: Table1
  });

  // _xyz.mapview.changeEnd = _xyz.utils.compose(
  //   _xyz.mapview.changeEnd,
  //   () => _xyz.tableview.current_table.update()
  // );

  // _xyz.layers.list['Mapbox Base'].remove();

  //_xyz.layers.list.COUNTRIES.style.theme = null;

  // _xyz.layers.list.COUNTRIES.show();

  // _xyz.locations.select(
  //   //params
  //   {
  //     locale: 'NE',
  //     dbs: 'XYZ',
  //     layer: 'COUNTRIES',
  //     table: 'dev.natural_earth_countries',
  //     id: 80,
  //   },
  //   //callback
  //   location=>{
  //     // location.style.fillColor = '#f44336';
  //     // location.style.fillOpacity = 1;
  //     location.draw();
  //     document.getElementById('location_info_container2').appendChild(location.view.node);
  //   }
  // );

  // _xyz.layers.list.COUNTRIES.style.setLegend(document.getElementById('location_info_container2'));

}



function Grid(_xyz) {

  _xyz.layers.list.grid.grid_size = 'gen_female__11';
  
  _xyz.layers.list.grid.grid_color = 'gen_male__11';
  
  _xyz.layers.list.grid.grid_ratio = true;

  _xyz.layers.list.grid.show();

  _xyz.layers.list.grid.style.setLegend(Info1);

}

function Offices(_xyz) {

  _xyz.layers.list.offices.singleSelectOnly = true;

  _xyz.layers.list.offices.show();

  _xyz.locations.select_output = location => {
    Info1.innerHTML = location.infoj[1].value;
  };

}