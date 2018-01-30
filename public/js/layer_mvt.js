const L = require('leaflet');
require('leaflet.vectorgrid');
const utils = require('./utils');



function getLayer(_, layer){

    console.log(layer.name);
    
    // let
    //     _mvt_layer_options = {
    //         rendererFactory: L.canvas.tile,
    //         interactive: true,
    //         zIndex: 2,
    //         pane: _.countries[_.country].layers[_layer].pane,
    //         getFeatureId: function (f) {
    //             return f.properties.qid;
    //         },
    //         vectorTileLayerStyles: {}
    //     },
    //     hl,
    //     _hl_style,
    //     _select_style;
    
    // // check if styles are set
    // _mvt_layer_options.vectorTileLayerStyles[_layer] = _.countries[_.country].layers[_layer].style ?
    //     _.countries[_.country].layers[_layer].style :
    //     _.layers.style;

    //     _hl_style = _.countries[_.country].layers[_layer].styleHighlight ?
    //     _.countries[_.country].layers[_layer].styleHighlight :
    //     _.layers.styleHighlight;

    //     _select_style = _.countries[_.country].layers[_layer].styleSelection ?
    //     _.countries[_.country].layers[_layer].styleSelection :
    //     _.layers.styleSelection;
    
    // // make sure layer checkbox if active
    // document.getElementById(_.layers.layers[_layer].DOM_id).disabled = false;
    
    // let _zoom = _.map.getZoom(),
    //     _arrayZoom = _.countries[_.country].layers[_layer].arrayZoom,
    //     _zoomKeys = Object.keys(_arrayZoom),
    //     _maxZoomKey = parseInt(_zoomKeys[_zoomKeys.length - 1]);
    
    // // Assign the table based on the zoom array.
    // _.layers.layers[_layer].table = _zoom > _maxZoomKey ?
    //     _arrayZoom[_maxZoomKey] : _zoom < _zoomKeys[0] ?
    //         null : _arrayZoom[_zoom];
    
    // // Initiate data request.
    // if(_.layers.layers[_layer].table){
    //     let bounds = _.map.getBounds(),
    //         url = localhost + 'mvt/{z}/{x}/{y}'
    //         + "?" + utils.paramString({
    //             table: _.layers.layers[_layer].table,
    //             layer: _layer,
    //             west: bounds.getWest(),
    //             south: bounds.getSouth(),
    //             east: bounds.getEast(),
    //             north: bounds.getNorth()
    //         });
        
    //     // Check for existing layer and remove from map.
    //     if(_.layers.layers[_layer].layer) _.map.removeLayer(_.layers.layers[_layer].layer);
        
    //     _.layers.layers[_layer].layer = L.vectorGrid.protobuf(url, _mvt_layer_options)
    //         .on('load', function(){
    //             if(_.layers.layers[_layer].selected){
    //                 selectLayer(_.layers.layers[_layer].selected);
    //             }
    //         })
    //         .on('click', function(e){
    //             if(e.layer.properties.qid === _.layers.layers[_layer].selected){
    //                 clearSelection(e.layer.properties.qid);
    //             } else {
    //                 selectLayer(e.layer.properties.qid, e.latlng);
    //                 L.DomEvent.stop(e);
    //             }
    //         })
    //         .on('mouseover', function(e){
    //             clearHighlight(_layer);
    //             hl = e.layer.properties.qid;
    //             if(hl !== _.layers.layers[_layer].selected){
    //                 this.setFeatureStyle(hl, _hl_style);
    //             } 
    //         })
    //         .on('mouseout', function(e){
    //             clearHighlight(_layer);
    //         })
    //         .addTo(_.map);
    // } else {
    //     // Set the layersCheck for the vector 
    //     _.layersCheck(_layer, null);
        
    //     // remove layer if there's no table
    //     if(_.layers.layers[_layer].layer) _.map.removeLayer(_.layers.layers[_layer].layer);
    //     document.getElementById(_.layers.layers[_layer].DOM_id).disabled = true;
    // }
    
    // function clearHighlight(_layer){
    //     if(hl && hl !== _.layers.layers[_layer].selected){
    //         _.layers.layers[_layer].layer.resetFeatureStyle(hl);
    //     }
    //     hl = null;
    // }
    
    // // Select a vector layer
    // _.layers.layers[_layer].selectLayer = selectLayer;
    
    // function selectLayer(id, latlng){
        
    //     // Create new xhr for /q_vector_info?
    //     let xhr = new XMLHttpRequest();
        
    //     xhr.open('GET', localhost + 'q_vector_info?' + utils.paramString({
    //         qid: id
    //     }));
        
    //     // Display the selected layer feature on load event.
    //     xhr.onload = function (){
    //         if(this.status === 200){
    //             let json = JSON.parse(this.responseText),
    //                 infoj = JSON.parse(json[0].infoj),
    //                 geomj = JSON.parse(json[0].geomj);

    //             let feature = {};
    //             feature.geometry = geomj;
    //             feature.infoj = infoj;
    //             feature.marker = [latlng.lng, latlng.lat];
                
    //             setTimeout(function () {
    //                 console.log(infoj);
    //                 // test select module
    //                 if(_.select) _.select.add(feature);
    //             }, 300);
                
    //             if(_.hooks.selected){
                    
    //                 // set new selection
    //                 _.hooks.selected = _.pushHook(_.hooks.selected.split(","), _.respaceHook(_layer) + "." + id);
                
    //             } else {
    //                 _.hooks.selected = _.pushHook([], _.respaceHook(_layer) + "." + id);   
    //             }
                
    //             _.setHook("selected", _.hooks.selected);
    //         }
    //     }
    //     if(_.layers.layers[_layer].selected){
    //         clearSelection(_.layers.layers[_layer].selected);
    //     } 
    //     _.layers.layers[_layer].selected = id;
    //     _.layers.layers[_layer].layer.setFeatureStyle(id, _select_style);
    //     xhr.send();
    // }
    
    // // clear selection
    // _.layers.layers[_layer].clearSelection = clearSelection;
    
    // function clearSelection(_id){
    //     _.layers.layers[_layer].layer.resetFeatureStyle(_id);
    //     _.layers.layers[_layer].selected = null;
    //     _.layersCheck(_layer, null);
        
    //     _.hooks.selected = _.popHook(_.hooks.selected.split(","), _.respaceHook(_layer) + "." + _id);
    //     // check if anything left
    //     if(_.hooks.selected){
    //         _.setHook("selected", _.hooks.selected);
    //     } else {
    //         _.removeHook("selected");
    //     }
    // }
    
    // _.layers.layers[_layer].clearLayers = clearLayers;
    // function clearLayers(){
    //     if(_.layers.layers[_layer].layer) _.map.removeLayer(_.layers.layers[_layer].layer);
    // }
    
}

module.exports = {
    getLayer: getLayer
}