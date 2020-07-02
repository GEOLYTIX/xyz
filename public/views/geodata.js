const xyz = _xyz({
  host: 'http://localhost:3000/geodata'
})

xyz.workspace.get.locale({
  locale: 'London'
}).then(createMap)

function createMap(locale) {

  xyz.locale = locale;

  xyz.mapview.create({
    target: document.getElementById('map_geodata'),
    attribution: {}
  });

  document.querySelector('#geodata__select > div').click();

  const btnZoomIn = document.querySelector('.geodata__content > .btn-column > .btn-zoomin');
  btnZoomIn.onclick = function (e) {
    const z = parseInt(xyz.map.getView().getZoom() + 1);
    xyz.map.getView().setZoom(z);
    e.target.disabled = (z >= xyz.workspace.locale.maxZoom);
  }

  const btnZoomOut = document.querySelector('.geodata__content > .btn-column > .btn-zoomout');
  btnZoomOut.onclick = function (e) {
    const z = parseInt(xyz.map.getView().getZoom() - 1);
    xyz.map.getView().setZoom(z);
    e.target.disabled = (z <= xyz.workspace.locale.minZoom);
  }

  xyz.mapview.node.addEventListener('changeEnd', function () {
    const z = xyz.map.getView().getZoom();
    btnZoomIn.disabled = z >= xyz.workspace.locale.maxZoom;
    btnZoomOut.disabled = z <= xyz.workspace.locale.minZoom;
  })

  xyz.locations.selectCallback = location => {

    const locationview = xyz.utils.wire()`<div class="location-view" style="padding: 10px;">`

    locationview.appendChild(xyz.locations.view.infoj(location))

    xyz.mapview.popup.create({
      coords: location.marker,
      content: locationview
    })

  }

}

document.querySelectorAll('#geodata__select > div').forEach(function (el) {

  el.onclick = function () {

    document.querySelector('#geodata__select > .bold') && document.querySelector('#geodata__select > .bold').classList.remove('bold');

    el.classList.add('bold');

    document.querySelector('.geodata__info').innerHTML = '';

    if (el.dataset.faq) return document.getElementById('geodata__faq').style.display = 'grid';

    document.getElementById('geodata__faq').style.display = 'none';

    el.dataset.layers.split(',').forEach(function (layer) {

      xyz.workspace.get.layer({
        locale: xyz.locale.key,
        layer: layer
      }).then(layer => {
        xyz.layers.decorate(layer).show()

        if (layer.groupmeta) {
          document.querySelector('.geodata__info').innerHTML = layer.groupmeta;
        }

        if (layer.style.theme || layer.format === 'grid') {
          document.querySelector('.geodata__info').appendChild(xyz.layers.view.style.legend(layer));
        }

      })

      //xyz.map.updateSize();
    });

    document.querySelector('.geodata__content > .btn-column > .btn-fullscreen').href = "https://xyz-geodata-v2.now.sh/geodata?layers=Mapbox Baselayer,Mapbox Labels," + el.dataset.layers + "&locale=London";

  }
});