const L = require('leaflet');
const helper = require('./helper');
const cluster = require('./cluster'); // import cluster layer
const mvt = require('./mvt'); // import mvt layer
const gjson = require('./gjson'); // import geojson layer

module.exports = function(_this){
    
    _this.vector.dom = {};
    
    // used in layer manager
    _this.vector.dom.layers = document.querySelector('#layers_module .page_content table.checkbox');
    _this.vector.dom.chkIdPref = "chkVectorLayer_";
    
    // module container
    //_this.vector.dom.container = document.querySelector('#layers_module > .swipe_container');
    
    // used in cluster layer
    _this.vector.dom.btnMap = document.querySelector('.map_button');
    _this.vector.dom.btnZoomLoc = document.getElementById('btnZoomLoc');
    _this.vector.dom.location_drop = document.querySelector('.location_drop');
    _this.vector.dom.locationTable = document.querySelector('.location_table');
    _this.vector.dom.locLegendId =  'layers-legend'; //id only as passed to both JS and D3.
    _this.vector.dom.map = document.getElementById('map');
    _this.vector.dom.locDropClose = document.querySelector('.location_drop__close');

    // locale.vector is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.vector = function (change_country) {
        
        // Remove some hooks when country is changed or select feature if hook exists
        if (change_country) {
            _this.vector.layers = {}; // cleared any pre existing layers
            _this.removeHook('layers'); //remove selection
            _this.removeHook('selected'); //remove selection
            
        // Remove existing layers and/or any selections
            Object.keys(_this.vector.layers).map(_key => {
                _this.vector.layers[_layer].clearLayers();
            });
    
        } 
        
        // Add layer management
        layer_manager();
        
        // check for selections
        if(_this.hooks.selected){
            let selections = _this.readSelectionMultiHook();
            console.log(selections);
            console.log(_this.vector.layers);
            Object.keys(selections).map(function(_key){
                _this.vector.layers[_key].selectLayer(selections[_key]);
            });
        }
        
    };
    
    _this.locale.vector();
    
    function layer_manager(){
           
        _this.vector.dom.layers.innerHTML = ""; // remove layer manager

        let content = '';
        
        // add checkboxes for available layers
        Object.keys(_this.countries[_this.country].vector).map(function(_layer){
            
            // Initialize layer object
            _this.vector.layers[_layer] = {};
            
            // remove space to apply element id
            let layer_id = _this.respaceHook(_layer, "_");
            
            // save element id for reference
            _this.vector.layers[_layer].DOM_id = _this.vector.dom.chkIdPref + layer_id;
            
            content += "<tr><td class='box'><input type='checkbox' id='" + _this.vector.layers[_layer].DOM_id + "'><label for='" + _this.vector.layers[_layer].DOM_id + "'></label></td><td>" + _layer + "</td></tr>";
        });
        
        // update DOM
        _this.vector.dom.layers.innerHTML = content;
        
        // add onchange event to each checkbox to update display state 
        Object.keys(_this.vector.layers).map(function(_layer){
             
           let _id =  _this.vector.layers[_layer].DOM_id;
            
            document.getElementById(_id).addEventListener("change", function(){
                this.checked ? _this.vector.layers[_layer].display = true : _this.vector.layers[_layer].display = false;
                
                // Check for existing layer and remove from map.
                //if (_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
                //_this.vector.layers[_layer].clearLayers();
                
                // get layer format
                let _format = _this.countries[_this.country].vector[_layer].format;
                
                if(_this.vector.layers[_layer].display){
            
                    // set web hook
                    if(_this.hooks.layers) {
                        _this.hooks.layers = _this.pushHook(_this.hooks.layers.split(","), _layer);
                    } else {
                        _this.hooks.layers = _this.pushHook([], _layer);
                    }
                    _this.setHook("layers", _this.hooks.layers);
                    
                    if(_format === 'geojson') gjson.getLayer(_this, _layer); // render geojson layer
                    if(_format === 'mvt') mvt.getLayer(_this, _layer); // render mvt layer
                    if(_format === 'cluster') cluster.getLayer(_this, _layer); // render cluster layer with legend
                    
                } else {
                    
                    _this.vector.layers[_layer].clearLayers();
                   
                    
                    // remove multi hook if layer not displayed
                    if(_this.hooks.layers){
                        _this.hooks.layers = _this.popHook(_this.hooks.layers.split(","), _layer);
                        // check if anything left
                        if(_this.hooks.layers) {
                        _this.setHook("layers", _this.hooks.layers);
                        } else {
                            _this.removeHook("layers");   
                        }
                    } else {
                        _this.removeHook("layers");   
                    }
                    
                    // remove select multi hook if layer not displayed
                    if(_this.hooks.selected){
                
                        _this.hooks.selected = _this.popHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + _this.vector.layers[_layer].selected);
                        _this.vector.layers[_layer].selected = null;
                        // check if anything left
                        if(_this.hooks.selected) {
                            _this.setHook("selected", _this.hooks.selected);
                        } else {
                            _this.removeHook("selected");   
                        }
                    } else {
                        _this.removeHook("selected");   
                    }
                    
                }
            });
        });
        
        //Check for vector display hook
        if(_this.hooks.layers && _this.vector.layers){
            
            // read layers from web hooks
            let _layer_hooks = _this.hooks.layers.split(",");
            
            // select layers to load
            _layer_hooks.map(item => {
                _this.vector.layers[_this.unspaceHook(item)].display = true;
                document.getElementById(_this.vector.dom.chkIdPref + _this.respaceHook(_this.unspaceHook(item), "_")).checked = true;
            });
            getLayers();  // load layers
        } 
    }
    
    // Get vector layers. Called on view change end in locale.
    _this.vector.getLayers = getLayers;
    
    function getLayers(){
        
        Object.keys(_this.countries[_this.country].vector).map(function(_layer){
            let _format = _this.countries[_this.country].vector[_layer].format;
                
            if(_this.vector.layers[_layer].display){
                
                if(_format === 'geojson') gjson.getLayer(_this, _layer); // render geojson layer
                if(_format === 'mvt') mvt.getLayer(_this, _layer); // render mvt layer
                if(_format === 'cluster') cluster.getLayer(_this, _layer); // render cluster layer with legend
            } 
        });
    }
};