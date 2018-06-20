const utils = require('./utils');

function getLayer() {
    let layer = this;
    if (layer.display && !layer.base) {
        layer.loader.style.display = 'block';

        let uri = layer.provider ?
            host + 'proxy/image?' + layer.URI + '&provider=' + layer.provider :
            layer.URI;

        layer.base = L.tileLayer(uri, {
            pane: layer.pane[0]
        })
            .addTo(_xyz.map)
            .on('loading', function () {
                layer.loader.style.display = 'block';
            })
            .on('load', function () {
                layer.loader.style.display = 'none';
                //layersCheck();
            });
    }
}

module.exports = {
    getLayer: getLayer
}