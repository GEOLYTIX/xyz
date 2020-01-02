const geodata_select = document.getElementById('geodata__select');

document.querySelectorAll('#geodata__select > div').forEach(function(el){

    el.onclick = function() {

        document.querySelector('#geodata__select > .selected') && document.querySelector('#geodata__select > .selected').classList.remove('selected');

        el.classList.add('selected');

        document.getElementById('map_geodata').innerHTML = '';
        document.querySelector('.geodata__info').innerHTML =  '';

        if (el.dataset.faq) return document.getElementById('geodata__faq').style.display = 'block';

        document.getElementById('geodata__faq').style.display = 'none';

        _xyz({
            host: 'http://localhost:3000/geodata',
            locale: el.dataset.locale,
            callback: function(_xyz) {
       
                _xyz.mapview.create({
                    target: document.getElementById('map_geodata'),
                });
                      
                el.dataset.layers.split(',').forEach(function(layer){

                    _xyz.layers.list[layer].show();

                    if (_xyz.layers.list[layer].groupmeta) {
                        document.querySelector('.geodata__info').innerHTML = _xyz.layers.list[layer].groupmeta;
                    }

                    if (_xyz.layers.list[layer].style.theme) {
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
        
            }});

    }});

document.querySelector('#geodata__select > div').click();