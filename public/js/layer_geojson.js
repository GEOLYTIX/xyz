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
        
        // Open & send vector.xhr;
        let bounds = _xyz.map.getBounds();
        
        this.xhr.open('GET', localhost + 'q_vector?' + utils.paramString({
            dbs: layer.dbs,
            table: layer.table,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        }));
        
        // Draw layer on load event.
        layer.xhr.onload = function(){
            if(this.status === 200){

                // Create feature collection for vector features.
                let data = JSON.parse(this.responseText),
                    areas = {
                        type: 'FeatureCollection',
                        features: []
                    };

                // Push features from the data object into feature collection.
                Object.keys(data).map(function(key){
                    areas.features.push({
                        type: 'Feature',
                        geometry: JSON.parse(data[key].geomj),
                        properties: {
                            qid: data[key].qid
                        }
                    });
                });
                
                // Check for existing layer and remove from map.
                if (layer.L) _xyz.map.removeLayer(layer.L);
                
                // Add geoJSON feature collection to the map.
                layer.L = L.geoJSON(areas, {
                        style: layer.style,
                        pane: layer.pane[0],
                        pointToLayer: function(point, latlng){
                            return L.circleMarker(latlng, {
                                radius: 5
                            });
                        }
                    })
                    .on('click', function(e){
                        _xyz.select.selectLayerFromEndpoint({
                            layer: layer.layer,
                            qTable: layer.table,
                            qID: e.layer.feature.properties.qid,
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