module.exports = function(_xyz) {
    
    let layer = this;
    if (layer.display && !layer.base) {
        layer.loader.style.display = 'block';

        let uri = layer.provider ?
        _xyz.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&noredirect=true':
            layer.URI;

        layer.base = L.tileLayer(uri, {
            pane: layer.pane[0]
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