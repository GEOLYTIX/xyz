(async () => {

  const xyz = _xyz();

  await xyz.init({
    // token: API token,
    host: document.head.dataset.dir
  });
  
  xyz.loadLocale({
    locale: 'GB'
  });

  xyz.mapview.create({
    target: document.getElementById('xyz_map1'),
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
  
  xyz.layers.list.retail_points.show();

  xyz.locate.toggle();

  xyz.locations.select_popup = location => {
    let container = document.getElementById('location_info_container1');
    container.innerHTML = '';
    container.appendChild(location.info_table);
  };

})();



_xyz().init({
  // token: API token,
  host: document.head.dataset.dir,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('xyz_map2'),
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

    _xyz.tableview.createTable({
      layer: _xyz.layers.list.COUNTRIES,
      target: document.getElementById('xyz_table1')
    });

    _xyz.viewChangeEnd = _xyz.utils.compose(_xyz.viewChangeEnd, () => {
      _xyz.tableview.updateTable();
    });
  
    _xyz.layers.list['Mapbox Base'].remove();

    _xyz.layers.list.COUNTRIES.style.theme = null;
  
    _xyz.layers.list.COUNTRIES.show();

  }
});



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

}

function Offices(_xyz) {

  _xyz.layers.list.offices.singleSelectOnly = true;

  _xyz.layers.list.offices.show();

  _xyz.locations.select_output = location => {
    document.getElementById('location_info_container1').innerHTML = location.infoj[1].value;
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