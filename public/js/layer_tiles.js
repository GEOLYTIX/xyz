const utils = require('./utils');

function getLayer() {
    if (this.display && !this.base) {
        // this.base = L.tileLayer(this.URI + '?access_token=' + mapbox_token, {
        //     pane: this.pane[0]
        // })
        //     .addTo(_xyz.map)
        //     .on('load', function () {
        //         //layersCheck();
        //     });

        this.base = L.tileLayer(this.URI + '?app_id=0owuUANxIPZxo61Je01Z&app_code=tX47CY23QlC-v-8P7hrVvQ', {
            pane: this.pane[0]
        })
            .addTo(_xyz.map)
            .on('load', function () {
                //layersCheck();
            });
    }

    //https://2.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/satellite.day/5/15/12/256/png8?app_id={YOUR_APP_ID}&app_code={YOUR_APP_CODE}

}

module.exports = {
    getLayer: getLayer
}