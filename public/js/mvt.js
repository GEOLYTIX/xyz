const L = require('leaflet');
const helper = require('./helper');

require('leaflet.vectorgrid');

function getLayer(_this, _layer){
    
    let _mvt_layer_options = {
        rendererFactory: L.canvas.tile,
        interactive: true,
        zIndex: 2,
        pane: _this.countries[_this.country].vector[_layer].pane,
        getFeatureId: function(f){
            return f.properties.qid;
        },
        vectorTileLayerStyles: {}
        },
        hl, _hl_style, _select_style;
    
    // check if styles are set
    _this.countries[_this.country].vector[_layer].style ?_mvt_layer_options.vectorTileLayerStyles[_layer] = _this.countries[_this.country].vector[_layer].style : _mvt_layer_options.vectorTileLayerStyles[_layer] = _this.vector.style;
    
    _this.countries[_this.country].vector[_layer].styleHighlight ? _hl_style = _this.countries[_this.country].vector[_layer].styleHighlight : _hl_style = _this.vector.styleHighlight;
    
    _this.countries[_this.country].vector[_layer].styleSelection ? _select_style =  _this.countries[_this.country].vector[_layer].styleSelection : _select_style = _this.vector.styleSelection;
    
    // make sure layer checkbox if active
    document.getElementById(_this.vector.layers[_layer].DOM_id).disabled = false;
    
    let _zoom = _this.map.getZoom(),
        _arrayZoom = _this.countries[_this.country].vector[_layer].arrayZoom,
        _zoomKeys = Object.keys(_arrayZoom),
        _maxZoomKey = parseInt(_zoomKeys[_zoomKeys.length - 1]);
    
    // Assign the table based on the zoom array.
    _this.vector.layers[_layer].table = _zoom > _maxZoomKey ?
        _arrayZoom[_maxZoomKey] : _zoom < _zoomKeys[0] ?
            null : _arrayZoom[_zoom];
    
    // Initiate data request.
    if(_this.vector.layers[_layer].table){
        let bounds = _this.map.getBounds(),
            url = localhost + 'mvt/{z}/{x}/{y}'
            + "?" + helper.paramString({
                table: _this.vector.layers[_layer].table,
                layer: _layer,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            });
        
        // Check for existing layer and remove from map.
        if(_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
        
        _this.vector.layers[_layer].layer = L.vectorGrid.protobuf(url, _mvt_layer_options)
            .on('load', function(){
                if(_this.vector.layers[_layer].selected){
                    selectLayer(_this.vector.layers[_layer].selected);
                }
            })
            .on('click', function(e){
                if(e.layer.properties.qid === _this.vector.layers[_layer].selected){
                    clearSelection(e.layer.properties.qid);
                } else {
                    selectLayer(e.layer.properties.qid);
                    L.DomEvent.stop(e);
                }
            })
            .on('mouseover', function(e){
                clearHighlight(_layer);
                hl = e.layer.properties.qid;
                if(hl !== _this.vector.layers[_layer].selected){
                    this.setFeatureStyle(hl, _hl_style);
                } 
            })
            .on('mouseout', function(e){
                clearHighlight(_layer);
            })
            .addTo(_this.map);
    } else {
        // Set the layersCheck for the vector 
        _this.locale.layersCheck(_layer, null);
        
        // remove layer if there's no table
        if(_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
        document.getElementById(_this.vector.layers[_layer].DOM_id).disabled = true;
    }
    
    function clearHighlight(_layer){
        if(hl && hl !== _this.vector.layers[_layer].selected){
            _this.vector.layers[_layer].layer.resetFeatureStyle(hl);
        }
        hl = null;
    }
    
    // Select a vector layer
    _this.vector.layers[_layer].selectLayer = selectLayer;
    
    function selectLayer(id){
        
        // Create new xhr for /q_vector_info?
        let xhr = new XMLHttpRequest();
        
        xhr.open('GET', localhost + 'q_vector_info?' + helper.paramString({
            qid: id
        }));
        
        // Display the selected layer feature on load event.
        xhr.onload = function (){
            if(this.status === 200){
                let json = JSON.parse(this.responseText),
                    infoj = JSON.parse(json[0].infoj); 
                
                setTimeout(function () {
                    console.log(infoj);
                    // test analyse module
                    if(_this.analyse) _this.analyse.add(infoj);
                }, 300);
                
                if(_this.hooks.selected){
                    
                    // set new selection
                    _this.hooks.selected = _this.pushHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + id);
                
                } else {
                    _this.hooks.selected = _this.pushHook([], _this.respaceHook(_layer) + "." + id);   
                }
                
                _this.setHook("selected", _this.hooks.selected);
            }
        }
        if(_this.vector.layers[_layer].selected){
            clearSelection(_this.vector.layers[_layer].selected);
        } 
        _this.vector.layers[_layer].selected = id;
        _this.vector.layers[_layer].layer.setFeatureStyle(id, _select_style);
        xhr.send();
    }
    
    // clear selection
    _this.vector.layers[_layer].clearSelection = clearSelection;
    
    function clearSelection(_id){
        _this.vector.layers[_layer].layer.resetFeatureStyle(_id);
        _this.vector.layers[_layer].selected = null;
        _this.locale.layersCheck(_layer, null);
        
        _this.hooks.selected = _this.popHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + _id);
        // check if anything left
        if(_this.hooks.selected){
            _this.setHook("selected", _this.hooks.selected);
        } else {
            _this.removeHook("selected");
        }
    }
    
    _this.vector.layers[_layer].clearLayers = clearLayers;
    function clearLayers(){
        if(_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
    }
    
}

module.exports = {
    getLayer: getLayer
}