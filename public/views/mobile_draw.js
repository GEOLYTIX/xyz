_xyz({
  host: document.head.dataset.dir || new String(''),
  callback: init,
  hooks: true,
  locale: 'GB'
});

function init(_xyz) {

  _xyz.mapview.create({
    target: document.getElementById('Map'),
    view: {
      lat: _xyz.hooks.current.lat,
      lng: _xyz.hooks.current.lng,
      z: _xyz.hooks.current.z
    },
    scrollWheelZoom: true,
    showScaleBar: 'never'
  });

  _xyz.layers.list['Mapbox Base'].show();
  _xyz.layers.list['Draw'].show();

  document.getElementById('Magic').onclick = e => {

    _xyz.mapview.interaction.draw.begin({
      layer: _xyz.layers.list['Draw'],
      type: 'LineString',
      freehand: true,
      // callback: () => {
      //   layer.view.header.classList.remove('edited');
      //   btn.classList.remove('active');
      // }
    });

  }

}