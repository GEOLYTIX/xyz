const L = require('leaflet');
const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = function () {

    // Set dom elements.
    let dom = {
        container: document.querySelector('#grid_module > .swipe_container'),
        pages: document.querySelectorAll('#grid_module .page_content'),
        legend: document.querySelector('#grid_module .legend'),
        btnDisplay: document.querySelector('#grid_module .btnDisplay'),
        btnOff: document.querySelector('#grid_module .btnOff'),
        selSize: document.querySelector('#grid_module .selSize'),
        selColor: document.querySelector('#grid_module .selColor'),
        chkGridRatio: document.getElementById('chkGridRatio')
    };

    // Create grid pane.
    _xyz.map.createPane('grid');
    _xyz.map.getPane('grid').style.zIndex = 520;

    // locale.grid is called upon initialisation and when the country is changed (change_country === true).
    _xyz.grid.init = function (change_country) {

        // Remove existing layer.
        if (_xyz.grid.layer) _xyz.map.removeLayer(_xyz.grid.layer);

        if (change_country) {
            _xyz.removeHook('qCount');
            _xyz.removeHook('qValue');
            _xyz.removeHook('grid_ratio');
            _xyz.removeHook('grid');       
            dom.pages[0].style.display = 'block';
            dom.container.style.marginLeft = '0';
            dom.pages[1].style.display = 'none';
        }

        // Set dropdown values and events.
        setDropDown(dom.selSize, 'qCount');
        setDropDown(dom.selColor, 'qValue');
        function setDropDown(select, query) {

            // Populate select options
            _xyz.countries[_xyz.country].grid.queryFields.map(function (queryField) {
                select.appendChild(
                    utils.createElement('option', {
                        value: queryField[0],
                        textContent: queryField[1]
                    })
                );
            });

            select.selectedIndex = _xyz.hooks[query] ? utils.getSelectOptionsIndex(select.options, _xyz.hooks[query]) : 0;

            // onchange event to set the hook and title.
            select.onchange = function () {
                _xyz.setHook(query, event.target.value);
            };
        }

        _xyz.grid.display = _xyz.hooks.grid || _xyz.grid.default;

        dom.chkGridRatio.checked = _xyz.hooks.grid_ratio;

        getLayer();
    };
    _xyz.grid.init();

    // Turn ON grid layer.
    dom.btnDisplay.addEventListener('click', function () {
        _xyz.setHook('grid', true);
        _xyz.grid.display = true;
        getLayer();
    });

    // Turn OFF grid layer.
    dom.btnOff.addEventListener('click', function () {
        if (_xyz.grid.layer) _xyz.map.removeLayer(_xyz.grid.layer);
        _xyz.removeHook('grid');
        _xyz.grid.display = false;
        dom.pages[0].style.display = 'block';
        dom.container.style.marginLeft = '0';
        dom.pages[1].style.display = 'none';
    });

    // Display count / value of grid cells as ratio.
    dom.chkGridRatio.addEventListener('click', function () {
        getLayer();
    });

    // Get location layer
    _xyz.grid.getLayer = getLayer;
    function getLayer() {
        let zoom = _xyz.map.getZoom(),
            bounds = _xyz.map.getBounds(),
            arrayZoom = _xyz.countries[_xyz.country].grid.arrayZoom,
            zoomKeys = Object.keys(arrayZoom),
            maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

        // Assign the table based on the zoom array.
        _xyz.grid.table = zoom > maxZoomKey ?
            arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
                null : arrayZoom[zoom];

        // Initiate data request only if table and display are true.
        if (_xyz.grid.table && _xyz.grid.display) {

            dom.pages[1].style.display = 'block';
            dom.legend.style.opacity = 0;
            dom.container.style.marginLeft = '-50%';
            dom.pages[0].style.display = 'none';

            // Create and open grid.xhr
            _xyz.grid.xhr = new XMLHttpRequest();
            _xyz.grid.xhr.open('GET', localhost + 'q_grid?' + utils.paramString({
                c: dom.selSize.selectedOptions[0].value,
                v: dom.selColor.selectedOptions[0].value,
                database: _xyz.countries[_xyz.country].grid.database,
                table: _xyz.grid.table,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }));

            // Draw layer on load event.
            _xyz.grid.xhr.onload = function () {
                if (this.status === 200) {

                    // Check for existing layer and remove from map.
                    if (_xyz.grid.layer) _xyz.map.removeLayer(_xyz.grid.layer);

                    // Add geoJSON feature collection to the map.
                    _xyz.grid.layer = new L.geoJson(processGrid(JSON.parse(this.responseText)), {
                        pointToLayer: function (feature, latlng) {

                            // Set size dependent on the location count against arraySize.
                            let size =
                                feature.properties.c < _xyz.grid.arraySize[1] ? 6 :
                                    feature.properties.c < _xyz.grid.arraySize[2] ? 8 :
                                        feature.properties.c < _xyz.grid.arraySize[3] ? 10 :
                                            feature.properties.c < _xyz.grid.arraySize[4] ? 12 :
                                                feature.properties.c < _xyz.grid.arraySize[5] ? 14 :
                                                    feature.properties.c < _xyz.grid.arraySize[6] ? 16 :
                                                    18;

                            let dot =
                                feature.properties.v < _xyz.grid.arrayColor[1] ? svg_symbols.dot(_xyz.grid.colorScale[0]) :
                                    feature.properties.v < _xyz.grid.arrayColor[2] ? svg_symbols.dot(_xyz.grid.colorScale[1]) :
                                        feature.properties.v < _xyz.grid.arrayColor[3] ? svg_symbols.dot(_xyz.grid.colorScale[2]) :
                                            feature.properties.v < _xyz.grid.arrayColor[4] ? svg_symbols.dot(_xyz.grid.colorScale[3]) :
                                                feature.properties.v < _xyz.grid.arrayColor[5] ? svg_symbols.dot(_xyz.grid.colorScale[4]) :
                                                    feature.properties.v < _xyz.grid.arrayColor[6] ? svg_symbols.dot(_xyz.grid.colorScale[5]) :
                                                        feature.properties.v < _xyz.grid.arrayColor[7] ? svg_symbols.dot(_xyz.grid.colorScale[6]) :
                                                        svg_symbols.dot(_xyz.grid.colorScale[6]);

                            // Return L.Marker with icon as style to pointToLayer.
                            return L.marker(
                                latlng,
                                {
                                    icon: L.icon({
                                        iconUrl: dot,
                                        iconSize: size
                                    }),
                                    pane: 'grid',
                                    interactive: false
                                });
                        }
                    });

                    _xyz.grid.layer.addTo(_xyz.map);
                    //_xyz.layersCheck();

                    svg_legends.createGridLegend(_xyz.grid, dom);
                }
            };
            _xyz.grid.xhr.send();
            //_xyz.layersCheck();

        } else {
            //_xyz.layersCheck();
        }
    }

    function processGrid(data){
        let avg_c = 0,
            avg_v = 0,
            dots = {
                type: "FeatureCollection",
                features: []
            };

        data.map(function(record){

            // lat = record[0]
            // lon = record[1]
            // id = record[2]
            // count = record[3]
            // value = record[4]
            if (parseFloat(record[3]) > 0) {
                record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);
                record[4] = isNaN(record[4]) ? record[4] : parseFloat(record[4]);

                // Make the value [4]
                if (dom.chkGridRatio.checked && record[4] > 0) record[4] /= record[3]

                avg_c += parseFloat(record[3]);
                avg_v += isNaN(record[4]) ? 0 : parseFloat(record[4]);

                dots.features.push({
                    "geometry": {
                        "type": "Point",
                        "coordinates": [record[0],record[1]]
                    },
                    "type": "Feature",
                    "properties": {
                        "c": parseFloat(record[3]),
                        "v": isNaN(record[4]) ? record[4] : parseFloat(record[4]),
                        "id": record[2] || null
                    }
                });
            }
        });

        let min = utils.getMath(data, 3, 'min'),
            max = utils.getMath(data, 3, 'max'),
            avg = avg_c / dots.features.length,
            step_lower = (avg - min) / 4,
            step_upper = (max - avg) / 3;

        _xyz.grid.arraySize = [];
        _xyz.grid.arraySize[0] = min;
        _xyz.grid.arraySize[1] = min + step_lower;
        _xyz.grid.arraySize[2] = min + (step_lower * 2);
        _xyz.grid.arraySize[3] = min + (step_lower * 3);
        _xyz.grid.arraySize[4] = avg;
        _xyz.grid.arraySize[5] = avg + step_upper;
        _xyz.grid.arraySize[6] = avg + (step_upper * 2);
        _xyz.grid.arraySize[7] = max;

        if (avg_v > 0) {
            min = utils.getMath(data, 4, 'min');
            max = utils.getMath(data, 4, 'max');
            avg = avg_v / dots.features.length;
            step_lower = (avg - min) / 4;
            step_upper = (max - avg) / 3;
            _xyz.grid.arrayColor = [];
            _xyz.grid.arrayColor[0] = min;
            _xyz.grid.arrayColor[1] = min + step_lower;
            _xyz.grid.arrayColor[2] = min + (step_lower * 2);
            _xyz.grid.arrayColor[3] = min + (step_lower * 3);
            _xyz.grid.arrayColor[4] = avg;
            _xyz.grid.arrayColor[5] = avg + step_upper;
            _xyz.grid.arrayColor[6] = avg + (step_upper * 2);
            _xyz.grid.arrayColor[7] = max;
        }
        return dots
    }

    _xyz.grid.statFromGeoJSON = function (feature) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_grid_info');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                feature.infoj = JSON.parse(this.response);
                _xyz.select.addFeature(feature);
            }
        }
        xhr.send(JSON.stringify({
            infoj: _xyz.countries[_xyz.country].grid.infoj,
            database: _xyz.countries[_xyz.country].grid.database,
            geometry: feature.geometry
        }));
    }
};