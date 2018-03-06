const utils = require('./utils');

function getLayer() {
    if (this.display && !this.base) {
        this.base = L.tileLayer(this.URI + '?access_token=' + mapbox_token, {
            pane: this.pane[0]
        })
            .addTo(_xyz.map)
            .on('load', function () {
                //layersCheck();
            });
    }
}

module.exports = {
    getLayer: getLayer
}