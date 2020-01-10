document.querySelectorAll('#geodata__select > div').forEach(function(el){

    el.onclick = function() {

        document.querySelector('#geodata__select > .bold') && document.querySelector('#geodata__select > .bold').classList.remove('bold');

        el.classList.add('bold');

        document.getElementById('map_geodata').innerHTML = '';
        document.querySelector('.geodata__info').innerHTML =  '';

        if (el.dataset.faq) return document.getElementById('geodata__faq').style.display = 'grid';

        document.getElementById('geodata__faq').style.display = 'none';

        _xyz({
            host: 'http://localhost:3000/geodata',
            locale: el.dataset.locale,
            callback: function(_xyz) {
       
                _xyz.mapview.create({
                    target: document.getElementById('map_geodata'),
                    attribution: {}
                });

                el.dataset.layers.split(',').forEach(function(layer){

                    _xyz.layers.list[layer].show();

                    if (_xyz.layers.list[layer].groupmeta) {
                        document.querySelector('.geodata__info').innerHTML = _xyz.layers.list[layer].groupmeta;
                    }

                    if (_xyz.layers.list[layer].style.theme || _xyz.layers.list[layer].format === 'grid') {
                        document.querySelector('.geodata__info').appendChild(_xyz.layers.view.style.legend(_xyz.layers.list[layer]));
                    }

                    _xyz.map.updateSize();
                });

                const btnZoomIn = document.querySelector('.geodata__content > .btn-column > .btn-zoomin');
                btnZoomIn.onclick = function(e){
                    const z = parseInt(_xyz.map.getView().getZoom() + 1);
                    _xyz.map.getView().setZoom(z);
                    e.target.disabled = (z >= _xyz.workspace.locale.maxZoom);
                }

                const btnZoomOut = document.querySelector('.geodata__content > .btn-column > .btn-zoomout');
                btnZoomOut.onclick = function(e){
                    const z = parseInt(_xyz.map.getView().getZoom() - 1);
                    _xyz.map.getView().setZoom(z);
                    e.target.disabled = (z <= _xyz.workspace.locale.minZoom);
                }

                _xyz.mapview.node.addEventListener('changeEnd', function(){
                    const z = _xyz.map.getView().getZoom();
                    btnZoomIn.disabled = z >= _xyz.workspace.locale.maxZoom;
                    btnZoomOut.disabled = z <= _xyz.workspace.locale.minZoom;
                  });

                document.querySelector('.geodata__content > .btn-column > .btn-fullscreen').href = "https://xyz-geodata-v2.now.sh/geodata?layers=Mapbox Baselayer,Mapbox Labels," + el.dataset.layers + "&locale=London";

                _xyz.locations.selectCallback = location => {

                    const locationview = _xyz.utils.wire()`<div class="location-view" style="padding: 10px;">`;

                    locationview.appendChild(_xyz.locations.view.infoj(location));

                    _xyz.mapview.popup.create({
                        coords: location.marker,
                        content: locationview
                    });

                }
        
            }
        });

    }
});

document.querySelector('#geodata__select > div').click();