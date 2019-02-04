(async () => {

  const _foo = _xyz();

  await _foo.init({
    host: document.head.dataset.dir,
    // token: API token,
    // map_id: 'xyz_map1',
    // locale: 'GB',
    // scrollWheelZoom: true,
    btnZoomIn: document.getElementById('btnZoomIn1'),
    btnZoomOut: document.getElementById('btnZoomOut1'),
  });
  
  _foo.loadLocale({
    locale: 'GB'
  });

  _foo.mapview.create({
    target: document.getElementById('xyz_map1'),
    view: {
      lat: 53,
      lng: -1,
      z: 8,
    },
  });
  
  _foo.layers.list.retail_points.show();

})();



_xyz().init({
  host: document.head.dataset.dir,
  // token: API token,
  // map_id: 'xyz_map2',
  // locale: 'NE',
  // btnZoomIn: document.getElementById('btnZoomIn2'),
  // btnZoomOut: document.getElementById('btnZoomOut2'),
  callback: _bar => {

    _bar.loadLocale({
      locale: 'NE'
    });

    _bar.mapview.create({
      target: document.getElementById('xyz_map2'),
      view: {
        lat: 53,
        lng: -1,
        z: 8,
      },
    });

    _bar.tableview.createTable({
      layer: _bar.layers.list.COUNTRIES,
      target: document.getElementById('xyz_table1')
    });

    _bar.layers.list['Mapbox Base'].remove();

    _bar.layers.list.COUNTRIES.style.theme = null;
  
    _bar.layers.list.COUNTRIES.show();

  }
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