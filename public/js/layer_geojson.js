const utils = require('./utils');

function getLayer(){
  
    // Assign the table based on the zoom array.
    let zoom = _xyz.map.getZoom(),
        zoomKeys = Object.keys(this.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
        this.table = zoom > maxZoomKey ?
        this.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : this.arrayZoom[zoom];
      
    if(this.table){

        // Create new vector.xhr
        this.loaded = false;
        this.xhr = new XMLHttpRequest(); 
        
        // Open & send vector.xhr;
        let layer = this,
            bounds = _xyz.map.getBounds();
        
        this.xhr.open('GET', localhost + 'q_vector?' + utils.paramString({
            table: this.table,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        }));
        
        // Draw layer on load event.
        this.xhr.onload = function(){
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
                        onEachFeature: function (_feature, _layer) {
                            _layer.on({

                                // Set styleHighlight on mouseover.
                                mouseover: function() {
                                    _layer.setStyle(layer.styleHighlight);
                                },

                                // Reset style on mouseout
                                mouseout: function() {
                                    _layer.setStyle(layer.style);
                                },
                                
                                // Select vector by its ID(qid).
                                click: function (e) {
                                    _xyz.select.selectLayerFromEndpoint({
                                        qTable: layer.table,
                                        qID: e.target.feature.properties.qid,
                                        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                                    });
                                }
                            });
                        },
                        pointToLayer: function(point, latlng){
                            return L.circleMarker(latlng, {
                                radius: 5
                            });
                        }
                    }).addTo(_xyz.map);

                    layer.loaded = true;
                    _xyz.layersCheck();
                
                // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
                if (!layer.table || !layer.display) _xyz.map.removeLayer(layer.L);
            }
        }
        
        this.xhr.send();
    }
}

module.exports = {
    getLayer: getLayer
}