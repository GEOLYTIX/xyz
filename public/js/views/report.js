const report_params = {};

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
  report_params[key] = decodeURI(value);
});

_xyz({
  token: document.body.dataset.token,
  host: document.head.dataset.dir,
  locale: report_params.locale,
  callback: Report
});

function Report(_xyz) {

  const layer = _xyz.layers.list[report_params.layer];
  
  // Get template
  const template = document.getElementById(report_params.template);

  let templateContent = template.content;

  document.body.appendChild(templateContent.cloneNode(true));

  // Make map
  _xyz.mapview.create({
    scrollWheelZoom: true,
    target: document.getElementById('xyz_map')
  });

  // Add legends for displayed layers if requested
  console.log(_xyz.layers.list);
  const current_layers = report_params.layers.split(',');

  Object.values(_xyz.layers.list).map(layer => {

    if(current_layers.includes(layer.key) && layer.table && layer.style && layer.style.theme){

      let legends_container = document.getElementById('xyz_legends');

      if(legends_container) {

        _xyz.utils.createElement({
          tag: 'div',
          options: {
            textContent: layer.name
          },
          appendTo: legends_container
        });

        _xyz.utils.createElement({
          tag: 'small',
          options: {
            textContent: layer.style.theme.label || ''
          },
          appendTo: legends_container
        });

      }

      _xyz.layers.list[layer.key].style.setLegend(document.getElementById('xyz_legends'));

    }
  });


  // check if location is requested
  let location_container = document.getElementById('xyz_location');

  if(location_container){
    _xyz.locations.select(
    //params
      {
        locale: report_params.locale,
        dbs: 'XYZ',
        layer: report_params.layer,
        table: layer.table,
        id: report_params.id,
      },
      //callback
      location=>{
        location.draw({
          pane: report_params.layer,
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
        location_container.appendChild(location.view.node);
        let chxs = document.querySelectorAll('.locationview .checkbox');
        for(let i = 0; i < chxs.length; i++){
          chxs[i].parentNode.style.display = 'none';

        }
      });
  }

  //_xyz.layers.list[report_params.layer].style.setLegend(document.getElementById('xyz_location'));


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