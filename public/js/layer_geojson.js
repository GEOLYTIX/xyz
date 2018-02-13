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
    layer.drawer.style.opacity = !layer.table? 0.4: 1;

    // Request layer data when table and display are true.
    if(layer.table && layer.display){
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest(); 
        
        // Build xhr request.
        let bounds = _xyz.map.getBounds();      
        this.xhr.open('GET', localhost + 'q_geojson?' + utils.paramString({
            dbs: layer.dbs,
            table: layer.table,
            qID: layer.qID,
            geomj: layer.geomj,
            geom: layer.geom,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        }));
        
        // Draw layer on load event.
        layer.xhr.onload = function(){
            if(this.status === 200){

                // Create feature collection for vector features.
                let features = JSON.parse(this.responseText);
                
                // Check for existing layer and remove from map.
                if (layer.L) _xyz.map.removeLayer(layer.L);
                
                // Add geoJSON feature collection to the map.
                layer.L = L.geoJSON(features, {
                        style: layer.style,
                        pane: layer.pane[0],
                        pointToLayer: function(point, latlng){
                            return L.circleMarker(latlng, {
                                radius: 9,
                                pane: layer.pane[0]
                            });
                        }
                    })
                    .on('click', function(e){
                        _xyz.select.selectLayerFromEndpoint({
                            layer: layer.layer,
                            table: layer.table,
                            id: e.layer.feature.properties.id,
                            marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                        });
                    })
                    .on('mouseover', function(e){
                        e.layer.setStyle(layer.styleHighlight);
                    })
                    .on('mouseout', function(e){
                        e.layer.setStyle(layer.style);
                    })
                    .addTo(_xyz.map);

                    layer.loader.style.display = 'none';
                    layer.loaded = true;
                    _xyz.layersCheck();
                
                // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
                if (!layer.table || !layer.display) _xyz.map.removeLayer(layer.L);
            }
        }
        layer.xhr.send();
    }
}

module.exports = {
    getLayer: getLayer
}