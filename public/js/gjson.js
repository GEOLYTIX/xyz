const L = require('leaflet');
const helper = require('./helper');

function getLayer(_this, _layer){
    
    let _zoom = _this.map.getZoom(),
        _arrayZoom = _this.countries[_this.country].vector[_layer].arrayZoom,
        _zoomKeys = Object.keys(_arrayZoom),
        _maxZoomKey = parseInt(_zoomKeys[_zoomKeys.length - 1]),
        _style, _highlight, _select;
    
    // Set checkbox as active
    document.getElementById(_this.vector.layers[_layer].DOM_id).disabled = false;
    
    // Assign the table based on the zoom array.
    _this.vector.layers[_layer].table = _zoom > _maxZoomKey ?
        _arrayZoom[_maxZoomKey] : _zoom < _zoomKeys[0] ?
            null : _arrayZoom[_zoom];
    
    // check if custom styles are set
    _this.countries[_this.country].vector[_layer].style ? _style = _this.countries[_this.country].vector[_layer].style : _style = _this.vector.style;
            
    _this.countries[_this.country].vector[_layer].styleHighlight ? _highlight = _this.countries[_this.country].vector[_layer].styleHighlight : _highlight = _this.vector.styleHighlight;
            
    _this.countries[_this.country].vector[_layer].styleSelection ? _select = _this.countries[_this.country].vector[_layer].styleSelection : _select = _this.vector.styleSelection;
    
    if(_this.vector.layers[_layer].table){
        // Create new vector.xhr
        _this.vector.layers[_layer].xhr = new XMLHttpRequest(); 
        
        // Open & send vector.xhr;
        let bounds = _this.map.getBounds(),
            url = localhost + 'q_vector?' + helper.paramString({
            table: _this.vector.layers[_layer].table,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        });
        
        _this.vector.layers[_layer].xhr.open('GET', url);
        
        // Draw layer on load event.
        _this.vector.layers[_layer].xhr.onload = function(){
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
                if (_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
                
                // Add geoJSON feature collection to the map.
                _this.vector.layers[_layer].layer = L.geoJSON(areas, {
                        style: _style,
                        pane: _this.countries[_this.country].vector[_layer].pane,
                        onEachFeature: function (feature, layer) {
                            layer.on({

                                // Set styleHighlight on mouseover.
                                mouseover: function (e) {
                                    layer.setStyle(_highlight);
                                },

                                // Reset style on mouseout
                                mouseout: function (e) {
                                    layer.setStyle(_style);
                                },
                                
                                // Select vector by its ID(qid).
                                click: function (e) {
                                    
                                    if(_this.vector.layers[_layer].selected && _this.hooks.selected){
                                        
                                        // remove previous selection
                                        _this.hooks.selected = _this.popHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + _this.vector.layers[_layer].selected);
                                        
                                        _this.map.removeLayer(_this.vector.layers[_layer].layerSelection);
                                            
                                        // check if any selection left
                                        if(_this.hooks.selected){
                                            _this.setHook("selected", _this.hooks.selected);
                                        } else {
                                            _this.removeHook("selected");
                                        }
                                        
                                        // check if not selected feature 
                                        if(_this.vector.layers[_layer].selected !== e.target.feature.properties.qid){
                                            
                                            selectLayer(e.target.feature.properties.qid);
                                        
                                        } else {
                                            
                                            _this.vector.layers[_layer].selected = null;
                                        
                                        }
                                        
                                    } else {
                                        selectLayer(e.target.feature.properties.qid);
                                    }
                                }
                            });
                        },
                        pointToLayer: function(point, latlng){
                            return L.circleMarker(latlng, {
                                radius: 5
                            });
                        }
                    }).addTo(_this.map);
                    _this.locale.layersCheck(_layer, true);
                
                // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
                if (!_this.vector.layers[_layer].table || !_this.vector.layers[_layer].display) _this.map.removeLayer(_this.vector.layers[_layer].layer);
            }
        }
        _this.vector.layers[_layer].xhr.send();
        _this.locale.layersCheck(_layer, false);
    
    } else {
        // Set the layersCheck for the vector 
        _this.locale.layersCheck(_layer, null);
        document.getElementById(_this.vector.layers[_layer].DOM_id).disabled = true;
        
        if(_this.vector.layers[_layer].layer){
            _this.map.removeLayer(_this.vector.layers[_layer].layer);
        }
    }
    
    // Select a vector layer.
    _this.vector.layers[_layer].selectLayer = selectLayer;
    function selectLayer(id, zoom){
        
        // Create new xhr for /q_vector_info?
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_vector_gjson_info?' + helper.paramString({
            qid: id
        }));
        
        // Display the selected layer feature on load event.
        xhr.onload = function(){
            if(this.status === 200){
                
                let json = JSON.parse(this.responseText),
                    geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj);
                
                // Remove layerSelection from map if exists.
                if (_this.vector.layers[_layer].layerSelection) _this.map.removeLayer(_this.vector.layers[_layer].layerSelection);
                
                // Create layerSelection from geoJSON and add to map.
                _this.vector.layers[_layer].layerSelection = L.geoJSON(
                    {
                        "type": "Feature",
                        "geometry": geomj
                    }, {
                        pane: 'vectorSelection',
                        style: _select
                  }).addTo(_this.map);
                _this.locale.layersCheck(_layer + '_select', true);
                
                // log infoj
                setTimeout(function () {
                    // apply data to analyze table
                    console.log(infoj);
                    // test analyse module
                    if(_this.analyze) _this.analyse.add(infoj);
                }, 300);
                
                // set multi hook
                if(_this.hooks.selected){
                    _this.hooks.selected = _this.pushHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + id);
                } else {
                    _this.hooks.selected = _this.pushHook([], _this.respaceHook(_layer) + "." + id);
                }
                _this.setHook("selected", _this.hooks.selected);
                _this.vector.layers[_layer].selected = id;
                
                if (zoom) _this.map.fitBounds(_this.vector.layers[_layer].layerSelection.getBounds());
            }
        }
        xhr.send();
        _this.locale.layersCheck(_layer + '_select', false);
    }
    
    _this.vector.layers[_layer].clearLayers = clearLayers;
    function clearLayers(){
        if (_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
        if (_this.vector.layers[_layer].layerSelection) _this.map.removeLayer(_this.vector.layers[_layer].layerSelection);
    }
}

module.exports = {
    getLayer: getLayer
}