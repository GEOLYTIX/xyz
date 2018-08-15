module.exports = function() {
    
    let layer = this;

    if (layer.display && global._xyz.token !== layer.token) {

        layer.token = global._xyz.token;

        layer.loader.style.display = 'block';

        let uri = layer.provider ?
        global._xyz.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + layer.token :
            layer.URI;

        if (layer.base) global._xyz.map.removeLayer(layer.base);

        layer.base = L.tileLayer(uri, {
            pane: layer.pane[0]
        })
            .addTo(global._xyz.map)
            .on('loading', e => {
                layer.loader.style.display = 'block';
            })
            .on('load', e => {
                layer.loader.style.display = 'none';
                //layersCheck();
            });
    }
}