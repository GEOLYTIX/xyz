require('leaflet.vectorgrid');
const utils = require('./utils');

function getLayer(){
        
    // Assign the table based on the zoom array.
    let layer = this,
        zoom = _xyz.map.getZoom(),
        zoomKeys = Object.keys(layer.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
        layer.table = zoom > maxZoomKey ?
        layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];

    // Make drawer opaque if no table present.
    layer.drawer.style.opacity = !layer.table ? 0.4 : 1;
      
    if(layer.table && layer.display){

        // Create new vector.xhr
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest();

        // Build xhr request.
        let bounds = _xyz.map.getBounds(),
            url = localhost + 'mvt/{z}/{x}/{y}?' + utils.paramString({
                dbs: layer.dbs,
                table: layer.table,
                qID: layer.qID,
                filter: layer.filter || '',
                layer: layer.layer,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }),
            options = {
                rendererFactory: L.canvas.tile,
                interactive: layer.infoj || false,
                pane: layer.pane[0],
                getFeatureId: function (f) {
                    return f.properties.id;
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
                    table: layer.table,
                    id: e.layer.properties.id,
                    marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                });
            })
            .on('mouseover', function(e){
                this.setFeatureStyle(e.layer.properties.id, layer.styleHighlight);
            })
            .on('mouseout', function(e){
                this.setFeatureStyle(e.layer.properties.id, layer.style);
            })
            .addTo(_xyz.map);
    }
}

module.exports = {
    getLayer: getLayer
}