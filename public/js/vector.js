const L = require('leaflet');
const helper = require('./helper');

require('leaflet.vectorgrid');

module.exports = function(_this){

    // locale.vector is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.vector = function (change_country) {

        // Remove existing layer and layerSelection.
        if (_this.vector.layer) _this.map.removeLayer(_this.vector.layer);
    
        // Check for vector display hook.
        if (_this.hooks.vector) {
            toggleVectorLayer(true);
        } else {
            _this.vector.display = false;
        }

        // Remove the vector_id hook when country is changed or select feature if hook exists
        if (change_country) {
            _this.removeHook('vector_id');
            _this.vector.container.style['marginLeft'] = '0';
            _this.vector.infoTable.innerHTML = '';
        } else if (_this.hooks.vector_id) {
            selectLayer(_this.hooks.vector_id);
        }
    };
    _this.locale.vector();

    // Toogle visibility of the vector layer.
    document.getElementById('btnVector--toggle').addEventListener('click', toggleVectorLayer);

    // Toggle vector layer function turns vector on with override === true.
    function toggleVectorLayer(override){
        let btn = document.getElementById('btnVector--toggle');
        helper.toggleClass(btn, 'on');
        if (_this.vector.display === false || override === true) {
            _this.vector.display = true;
            btn.innerHTML = 'Turn vectors off';
            _this.setHook('vector', true);
            getLayer();

        } else {
            _this.vector.display = false;
            btn.innerHTML = 'Turn vectors on';
            _this.removeHook('vector');
            if (_this.vector.layer) _this.map.removeLayer(_this.vector.layer);
            _this.locale.layersCheck('vector', null);
        }
    }

    // Unselect vector, clear info, remove hook and set container marginLeft to 0.
    document.getElementById('btnStatistics--off').addEventListener('click', function(){
       
        _this.removeHook('vector_id');
        clearSelection(_this.vector.selected);
    });

    // Get vector layer
    _this.vector.getLayer = getLayer;
    function getLayer() {
        
        let pbfLayer_options = {
            rendererFactory: L.canvas.tile,
            interactive: true,
            getFeatureId: function(f){
                return f.properties.qid;
            },
            vectorTileLayerStyles: {
                'vector': _this.vector.style
            }
        },
            hl;
        
        let zoom = _this.map.getZoom(),
            arrayZoom = _this.countries[_this.country].vector.arrayZoom,
            zoomKeys = Object.keys(arrayZoom),
            maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

        // Assign the table based on the zoom array.
        _this.vector.table = zoom > maxZoomKey ?
            arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
                null : arrayZoom[zoom];

        // Initiate data request only if table and display are true.
        if (_this.vector.table && _this.vector.display) {
            
            let bounds = _this.map.getBounds(),
                url = localhost + 'mvt/{z}/{x}/{y}'
            + "?" + helper.paramString({
                table: _this.vector.table,
                layer: "vector",
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            });
            
            // Check for existing layer and remove from map.
            if (_this.vector.layer) _this.map.removeLayer(_this.vector.layer);
            
            _this.vector.layer = L.vectorGrid.protobuf(url, pbfLayer_options)
                .on('load', function(){
                if(_this.vector.selected){
                    selectLayer(_this.vector.selected);
                }
            })
                .on('click', function(e){
                if(e.layer.properties.qid === _this.hooks.vector_id) clearSelection(e.layer.properties.qid);
                selectLayer(e.layer.properties.qid);
                L.DomEvent.stop(e);
            })
                .on('mouseover', function(e){
                clearHighlight();
                hl = e.layer.properties.qid;
                if(_this.hooks.vector_id){
                    if(hl !== _this.hooks.vector_id){
                        this.setFeatureStyle(hl, _this.vector.styleHighlight);
                    }
                } else {
                    this.setFeatureStyle(hl, _this.vector.styleHighlight);
                }
            })
                .on('mouseout', function(e){
                clearHighlight();
            })
                .addTo(_this.map);

           
            // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
            if (!_this.vector.table || !_this.vector.display){
                _this.map.removeLayer(_this.vector.layer);
                _this.locale.layersCheck('vector', false);}

        } else {

            // Set the layersCheck for the vector 
            _this.locale.layersCheck('vector', null);
        }
        
        function clearHighlight(){
            if(hl && hl !== _this.hooks.vector_id){
                _this.vector.layer.resetFeatureStyle(hl);
            }
            hl = null;
        }
    }

    // Select a vector layer.
    _this.vector.selectLayer = selectLayer;
    function selectLayer(id, zoom) {

        // Create new xhr for /q_vector_info?
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_vector_info?' + helper.paramString({
            qid: id
        }));

        // Display the selected layer feature on load event.
        xhr.onload = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText),
                    //geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj),
                    table = helper.createStatsTable(infoj);

                // Display results; use opacity with css transition for fade effect.
                _this.vector.infoTable.style['opacity'] = 0;
                setTimeout(function () {
                    _this.vector.infoTable.innerHTML = table;
                    _this.vector.infoTable.style['opacity'] = 1;
                }, 300);
                _this.vector.container.style['marginLeft'] = '-100%';

                _this.setHook('vector_id', id);

                //if (zoom) _this.map.fitBounds(_this.vector.layerSelection.getBounds());
            }
        };
        if(_this.vector.selected) clearSelection(_this.vector.selected);
        if(_this.hooks.vector_id === id) clearSelection(_this.hooks.vector_id);
        _this.vector.selected = id;
        _this.vector.layer.setFeatureStyle(id, _this.vector.styleSelection);
        xhr.send();
    }
    
    function clearSelection(id){
        _this.vector.layer.resetFeatureStyle(id);
        _this.vector.selected = null;
        _this.removeHook('vector_id');

        // Reset module panel
        _this.vector.container.style['marginLeft'] = '0';
        _this.vector.infoTable.innerHTML = '';
    }
};