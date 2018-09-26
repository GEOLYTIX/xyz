import _xyz from './_xyz.mjs';

import L from 'leaflet';

export default function() {
    
    let layer = this;

    if (layer.display) {

        layer.loader.style.display = 'block';

        let uri = layer.provider ?
        _xyz.ws.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + _xyz.ws.token :
            layer.URI;

        layer.base = L.tileLayer(uri, {
            pane: layer.pane[0],
            updateWhenIdle: true
        })
            .addTo(_xyz.ws.map)
            .on('loading', e => {
                layer.loader.style.display = 'block';
            })
            .on('load', e => {
                layer.loader.style.display = 'none';
                //layersCheck();
            });
    }
}