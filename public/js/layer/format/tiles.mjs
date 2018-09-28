import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default layer => {

    if (layer.display) {

        layer.loader.style.display = 'block';

        let uri = layer.provider ?
        _xyz.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + _xyz.token :
            layer.URI;

        layer.base = L.tileLayer(uri, {
            pane: layer.pane[0],
            updateWhenIdle: true
        })
            .addTo(_xyz.map)
            .on('loading', e => {
                layer.loader.style.display = 'block';
            })
            .on('load', e => {
                layer.loader.style.display = 'none';
                //layersCheck();
            });
    }
}