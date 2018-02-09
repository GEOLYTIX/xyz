require('leaflet.vectorgrid');
const utils = require('./utils');

function getLayer(){
        
    // Assign the table based on the zoom array.
    let zoom = _xyz.map.getZoom(),
        zoomKeys = Object.keys(this.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
        this.table = zoom > maxZoomKey ?
        this.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : this.arrayZoom[zoom];

    // Make drawer opaque if no table present.
    this.drawer.style.opacity = !this.table ? 0.4 : 1;
      
    if(this.table && this.display){

        // Create new vector.xhr
        this.loaded = false;
        this.loader.style.display = 'block';
        this.xhr = new XMLHttpRequest();

        // Open & send vector.xhr;
        let layer = this,
            bounds = _xyz.map.getBounds(),
            url = localhost + 'mvt/{z}/{x}/{y}?' + utils.paramString({
                dbs: layer.dbs,
                table: layer.table,
                qField: layer.qField,
                filter: layer.filter || '',
                layer: layer.layer,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }),
            options = {
                rendererFactory: L.canvas.tile,
                interactive: layer.interactive || false,
                pane: layer.pane[0],
                getFeatureId: function (f) {
                    return f.properties.qid;
                },
                vectorTileLayerStyles: {
                    //[layer.layer]: layer.style
                }
            };
        options.vectorTileLayerStyles[layer.layer] = layer.style;
        
        this.L = L.vectorGrid.protobuf(url, options)
            .on('load', function(){
                layer.loaded = true;
                layer.loader.style.display = 'none';
                _xyz.layersCheck();
            })
            .on('click', function(e){
                _xyz.select.selectLayerFromEndpoint({
                    layer: layer.layer,
                    qTable: layer.table,
                    qID: e.layer.properties.qid,
                    marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                });
            })
            .on('mouseover', function(e){
                this.setFeatureStyle(e.layer.properties.qid, layer.styleHighlight);
            })
            .on('mouseout', function(e){
                this.setFeatureStyle(e.layer.properties.qid, layer.style);
            })
            .addTo(_xyz.map);
    }
}

module.exports = {
    getLayer: getLayer
}