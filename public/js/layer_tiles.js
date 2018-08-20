module.exports = function() {
    
    let layer = this;

    if (layer.display) {

        layer.loader.style.display = 'block';

        let uri = layer.provider ?
        global._xyz.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + global._xyz.token :
            layer.URI;

        layer.base = L.tileLayer(uri, {
            pane: layer.pane[0],
            updateWhenIdle: true
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