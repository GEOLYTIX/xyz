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
        let url = host + 'mvt/{z}/{x}/{y}?' + utils.paramString({
                dbs: layer.dbs,
                table: layer.table,
                qID: layer.qID,
                properties: layer.properties,
                layer: layer.layer,
                geom_3857: layer.geom_3857,
                tilecache: layer.tilecache
            }),
            options = {
                rendererFactory: L.canvas.tile,
                interactive: (layer.infoj && layer.qID) || false,
                pane: layer.pane[0],
                getFeatureId: (f) => f.properties.id,
                vectorTileLayerStyles: {}
            };
        
        // set style for each layer
        options.vectorTileLayerStyles[layer.layer] = applyLayerStyle;
        
        function applyLayerStyle(properties, zoom){
            if (layer.style && layer.style.categorized && layer.style.categorized.cat[properties[layer.style.categorized.field]])
                return layer.style.categorized.cat[properties[layer.style.categorized.field]].style;

            return layer.style.default;
        }
        
        if(layer.L) _xyz.map.removeLayer(layer.L);
        
        layer.L = L.vectorGrid.protobuf(url, options)
            .on('load', (e) => {
                layer.loaded = true;
                layer.loader.style.display = 'none';
                _xyz.layersCheck();
            })
            .on('click', (e) => {
                _xyz.select.selectLayerFromEndpoint({
                    layer: layer.layer,
                    table: layer.table,
                    id: e.layer.properties.id,
                    marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                });
            })
            .on('mouseover', (e) => {
                e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight || {'color':'#090'});
            })
            .on('mouseout', (e) => {
                e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
            })
            .addTo(_xyz.map);
    }
}

module.exports = {
    getLayer: getLayer
}