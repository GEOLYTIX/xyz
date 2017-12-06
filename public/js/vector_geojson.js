const L = require('leaflet');
const helper = require('./helper');

module.exports = function(_this){

    // locale.vector is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.vector = function (change_country) {

        // Remove existing layer and layerSelection.
        if (_this.vector.layer) _this.map.removeLayer(_this.vector.layer);
        if (_this.vector.layerSelection) _this.map.removeLayer(_this.vector.layerSelection);

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
        if (_this.vector.layerSelection) _this.map.removeLayer(_this.vector.layerSelection);
        _this.removeHook('vector_id');
        _this.locale.layersCheck('vectorSelect', null);

        // Reset module panel
        _this.vector.container.style['marginLeft'] = '0';
        _this.vector.infoTable.innerHTML = '';
    });

    // Get vector layer
    _this.vector.getLayer = getLayer;
    function getLayer() {
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

            // Create new vector.xhr
            _this.vector.xhr = new XMLHttpRequest();

            // Open & send vector.xhr; Pass data to drawLayer().
            let bounds = _this.map.getBounds();
            _this.vector.xhr.open('GET', localhost + 'q_vector?' + helper.paramString({
                table: _this.vector.table,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }));

            // Draw layer on load event.
            _this.vector.xhr.onload = function () {
                if (this.status === 200) {

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
                    if (_this.vector.layer) _this.map.removeLayer(_this.vector.layer);

                    // Add geoJSON feature collection to the map.
                    _this.vector.layer = L.geoJSON(areas, {
                        style: _this.vector.style,
                        pane: 'vector',
                        onEachFeature: function (feature, layer) {
                            layer.on({

                                // Set styleHighlight on mouseover.
                                mouseover: function () {
                                    layer.setStyle(_this.vector.styleHighlight);
                                },

                                // Reset style on mouseout
                                mouseout: function () {
                                    layer.setStyle(_this.vector.style);
                                },

                                // Select vector by its ID(qid).
                                click: function () {
                                    selectLayer(layer.feature.properties.qid);
                                }
                            });
                        }
                    }).addTo(_this.map);
                    _this.locale.layersCheck('vector', true);

                    // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
                    if (!_this.vector.table || !_this.vector.display) _this.map.removeLayer(_this.vector.layer);

                }
            };
            _this.vector.xhr.send();
            _this.locale.layersCheck('vector', false);

        } else {

            // Set the layersCheck for the vector 
            _this.locale.layersCheck('vector', null);
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
                    geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj);

                // Remove layerSelection from map if exists.
                if (_this.vector.layerSelection) _this.map.removeLayer(_this.vector.layerSelection);

                // Create layerSelection from geoJSON and add to map.
                _this.vector.layerSelection = L.geoJSON(
                    {
                        "type": "Feature",
                        "geometry": geomj
                    }, {
                        pane: 'vectorSelection',
                        style: _this.vector.styleSelection,
                        onEachFeature: function (feature, layer) {

                            //Remove layer and hook when clicked on.
                            layer.on({
                                click: function () {
                                    _this.map.removeLayer(layer);
                                    _this.removeHook('area');
                                    _this.vector.container.style['marginLeft'] = '0';
                                    _this.vector.infoTable.innerHTML = '';
                                }
                            })
                        }
                    }).addTo(_this.map);
                _this.locale.layersCheck('vectorSelect', true);

                let table = helper.createStatsTable(infoj);

                // Display results; use opacity with css transition for fade effect.
                _this.vector.infoTable.style['opacity'] = 0;
                setTimeout(function () {
                    _this.vector.infoTable.innerHTML = table;
                    _this.vector.infoTable.style['opacity'] = 1;
                }, 300);
                _this.vector.container.style['marginLeft'] = '-100%';

                _this.setHook('vector_id', id);

                if (zoom) _this.map.fitBounds(_this.vector.layerSelection.getBounds());
            }
        };
        xhr.send();
        _this.locale.layersCheck('vectorSelect', false);

    }
};