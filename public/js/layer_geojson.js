const L = require('leaflet');
const utils = require('./helper');

function getLayer(_, layer){
  
    // Assign the table based on the zoom array.
    let zoom = _.map.getZoom(),
        zoomKeys = Object.keys(layer.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
    layer.table = zoom > maxZoomKey ?
        layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];
      
    if(layer.table){

        // Create new vector.xhr
        layer.xhr = new XMLHttpRequest(); 
        
        // Open & send vector.xhr;
        let bounds = _.map.getBounds(),
            url = localhost + 'q_vector?' + utils.paramString({
                table: layer.table,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            });
        
        layer.xhr.open('GET', url);
        
        // Draw layer on load event.
        layer.xhr.onload = function(){
            if(this.status === 200){

                // Create feature collection for vector features.
                let data = JSON.parse(this.responseText),
                    areas = {
                        "type": "FeatureCollection",
                        "features": []
                    };

                // Push features from the data object into feature collection.
                Object.keys(data).map(function(key){
                    areas.features.push({
                        "type": "Feature",
                        "geometry": JSON.parse(data[key].geomj),
                        "properties": {
                            "qid": data[key].qid
                        }
                    });
                });
                
                // Check for existing layer and remove from map.
                if (layer.l) _.map.removeLayer(layer.l);
                
                // Add geoJSON feature collection to the map.
                layer.l = L.geoJSON(areas, {
                        style: layer.style,
                        pane: layer.pane,
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
                                    

                                    alert(e.target.feature.properties.qid);

                                }
                            });
                        },
                        pointToLayer: function(point, latlng){
                            return L.circleMarker(latlng, {
                                radius: 5
                            });
                        }
                    }).addTo(_.map);

                    //_.locale.layersCheck(layer, true);
                
                // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
                if (!layer.table || !layer.display) _.map.removeLayer(layer.l);
            }
        }
        
        layer.xhr.send();
        //_.locale.layersCheck(layer, false);
    }
}
    
    // // Select a vector layer.
    // _.layers.layers[_layer].selectLayer = selectLayer;
    // function selectLayer(id, zoom){
        
    //     // Create new xhr for /q_vector_info?
    //     let xhr = new XMLHttpRequest();
    //     xhr.open('GET', localhost + 'q_vector_gjson_info?' + utils.paramString({
    //         qid: id
    //     }));
        
    //     // Display the selected layer feature on load event.
    //     xhr.onload = function(){
    //         if(this.status === 200){
                
    //             let json = JSON.parse(this.responseText),
    //                 geomj = JSON.parse(json[0].geomj),
    //                 infoj = JSON.parse(json[0].infoj),
    //                 areaj = JSON.parse(json[0].areaj) || null;
                
    //             //console.log(areaj);
                
    //             // Remove layerSelection from map if exists.
    //             if (_.layers.layers[_layer].layerSelection) _.map.removeLayer(_.layers.layers[_layer].layerSelection);
    //             if (_.layers.layers[_layer].layerArea) _.map.removeLayer(_.layers.layers[_layer].layerArea);
                
    //             // Create layerSelection from geoJSON and add to map.
    //             _.layers.layers[_layer].layerSelection = L.geoJSON(
    //                 {
    //                     "type": "Feature",
    //                     "geometry": geomj
    //                 }, {
    //                     pane: 'vectorSelection',
    //                     style: _select
    //               }).addTo(_.map);
    //             _.locale.layersCheck(_layer + '_select', true);
                
    //             // Create areaj layer if property exists
    //             if(areaj) {
    //                 _.layers.layers[_layer].layerArea = L.geoJSON(areaj, {
    //                         pane: 'vectorSelection',
    //                         interactive: false,
    //                         style: {
    //                             fill: true,
    //                             stroke: true,
    //                             weight: 1,
    //                             opacity: 0.4,
    //                             color: '#574B60',
    //                             fillColor: '#574B60',
    //                             fillOpacity: 0.2
                                
    //                         },
    //                         pointToLayer: function(point, latlng){
    //                             return L.circleMarker(latlng, {
    //                                 fill: true,
    //                                 //color: '#574B60',
    //                                 stroke: false,
    //                                 radius: 3,
    //                                 fillColor: '#574B60',
    //                                 weight: 1,
    //                                 opacity: 0.2
    //                             });
    //                         }
    //                     }).addTo(_.map);
    //                 _.locale.layersCheck(_layer + '_area', true);
    //             } else {
    //                 //console.log(areaj + ' not found.');
    //             }
                
                
    //             // log infoj
    //             setTimeout(function () {
    //                 // apply data to analyze table
    //                 console.log(infoj);
    //                 // test analyse module
    //                 if(_.analyze) _.analyse.add(infoj);
    //             }, 300);
                
    //             // set multi hook
    //             if(_.hooks.selected){
    //                 _.hooks.selected = _.pushHook(_.hooks.selected.split(","), _.respaceHook(_layer) + "." + id);
    //             } else {
    //                 _.hooks.selected = _.pushHook([], _.respaceHook(_layer) + "." + id);
    //             }
    //             _.setHook("selected", _.hooks.selected);
    //             _.layers.layers[_layer].selected = id;
                
    //             if (zoom) _.map.fitBounds(_.layers.layers[_layer].layerSelection.getBounds());
    //         }
    //     }
    //     xhr.send();
    //     _.locale.layersCheck(_layer + '_select', false);
    //     _.locale.layersCheck(_layer + '_area', false);
    // }
    
    // _.layers.layers[_layer].clearLayers = clearLayers;
    // function clearLayers(){
    //     if (_.layers.layers[_layer].layer) _.map.removeLayer(_.layers.layers[_layer].layer);
    //     if (_.layers.layers[_layer].layerSelection) _.map.removeLayer(_.layers.layers[_layer].layerSelection);
    //     if (_.layers.layers[_layer].layerArea) _.map.removeLayer(_.layers.layers[_layer].layerArea);
    // }

module.exports = {
    getLayer: getLayer
}