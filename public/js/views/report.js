const report_params = {};

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
  report_params[key] = decodeURI(value);
});


_xyz({
  token: document.body.dataset.token,
  host: document.head.dataset.dir,
  callback: Report
});


function Report(_xyz) {

  _xyz.mapview.create({
    scrollWheelZoom: true,
    target: document.getElementById('xyz_map')
  });

  _xyz.layers.list[report_params.layer].show();

  _xyz.locations.select(
    //params
    {
      locale: 'GB',
      dbs: 'XYZ',
      layer: report_params.layer,
      table: 'shepherd_neame.sites',
      id: report_params.id,
    },
    //callback
    location=>{
      location.draw({
        //pane: report_params.layer,
        color: '#090',
        stroke: true,
        fill: true,
        fillOpacity: 0,
        icon: {
          url: _xyz.utils.svg_symbols({
            type: 'markerColor',
            style: {
              colorMarker: '#090',
              colorDot: '#cf9'
            }
          }),
          anchor: [20,40],
          size: 40
        }
      });
      location.flyTo();
      document.getElementById('xyz_location').appendChild(location.view.node);
    }
  );

  // _xyz.tableview.locationTable({
  //   title: 'Population Summary',
  //   location: {
  //     layer: report_params.layer,
  //     id: report_params.id
  //   },
  //   target: document.getElementById('xyz_table1')
  // });

  // _xyz.tableview.locationTable({
  //   title: 'Age Profile',
  //   location: {
  //     layer: report_params.layer,
  //     id: report_params.id
  //   },
  //   target: document.getElementById('xyz_table2')
  // });

  // _xyz.tableview.locationTable({
  //   title: 'Social Grade',
  //   location: {
  //     layer: report_params.layer,
  //     id: report_params.id
  //   },
  //   target: document.getElementById('xyz_table3')
  // });

  // _xyz.tableview.locationTable({
  //   title: 'OAC Profile',
  //   location: {
  //     layer: report_params.layer,
  //     id: report_params.id
  //   },
  //   target: document.getElementById('xyz_table4')
  // });

}