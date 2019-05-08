_xyz({
  host: document.head.dataset.dir || new String(''),
  hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      view: {
        lat: 51.52,
        lng: 0.24,
        z: 6,
      }
    });

    //_xyz.layers.list['Advice Center'].show();
    //console.log(_xyz.layers.list['Advice Center']);

    _xyz.tableview.layerTable({
      layer: _xyz.layers.list['Advice Center'],
      target: document.getElementById('listviews'),
      key: 'gla',
      visible: ['organisation'],
      groupBy: 'borough',
      initialSort: [
          {
            column: 'organisation', dir: 'asc'
          },
          {
            column: 'borough', dir: 'asc'
          }
      ]
    });

  }
});
