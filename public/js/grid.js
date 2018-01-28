const L = require('leaflet');
const helper = require('./helper');
const svg_legends = require('./svg_legends');
const svg_symbols = require('./svg_symbols');

module.exports = function (_) {

    // Set dom elements.
    let dom = {};
    dom.container = document.querySelector('#grid_module > .swipe_container');
    dom.pages = document.querySelectorAll('#grid_module .page_content');
    dom.legend = document.querySelector('#grid_module .legend');
    dom.btnDisplay = document.querySelector('#grid_module .btnDisplay');
    dom.btnOff = document.querySelector('#grid_module .btnOff');
    dom.selSize = document.querySelector('#grid_module .selSize');
    dom.selColor = document.querySelector('#grid_module .selColor');
    dom.chkGridRatio = document.getElementById('chkGridRatio');

    // locale.grid is called upon initialisation and when the country is changed (change_country === true).
    _.locale.grid = function (change_country) {

        // Remove existing layer.
        if (_.grid.layer) _.map.removeLayer(_.grid.layer);

        if (change_country) {
            _.removeHook('qCount');
            _.removeHook('qValue');
            _.removeHook('grid_ratio');
            _.removeHook('grid');       
            dom.pages[0].style.display = 'block';
            dom.container.style.marginLeft = '0';
            dom.pages[1].style.display = 'none';
        }

        // Set dropdown values and events.
        setDropDown(dom.selSize, 'qCount');
        setDropDown(dom.selColor, 'qValue');
        function setDropDown(select, query) {

            // Populate select options
            _.countries[_.country].grid.queryFields.map(function (queryField) {
                select.appendChild(
                    helper.createElement('option', {
                        value: queryField[0],
                        textContent: queryField[1]
                    })
                );
            });

            select.selectedIndex = _.hooks[query] ? helper.getSelectOptionsIndex(select.options, _.hooks[query]) : 0;

            // onchange event to set the hook and title.
            select.onchange = function () {
                _.setHook(query, event.target.value);
            };
        }

        _.grid.display = _.hooks.grid || _.grid.default;

        dom.chkGridRatio.checked = _.hooks.grid_ratio;

        getLayer();
    };
    _.locale.grid();

    // Turn ON grid layer.
    dom.btnDisplay.addEventListener('click', function () {
        _.setHook('grid', true);
        _.grid.display = true;
        getLayer();
    });

    // Turn OFF grid layer.
    dom.btnOff.addEventListener('click', function () {
        if (_.grid.layer) _.map.removeLayer(_.grid.layer);
        _.removeHook('grid');
        _.grid.display = false;
        dom.pages[0].style.display = 'block';
        dom.container.style.marginLeft = '0';
        dom.pages[1].style.display = 'none';
    });

    // Display count / value of grid cells as ratio.
    dom.chkGridRatio.addEventListener('click', function () {
        getLayer();
    });

    // Get location layer
    _.grid.getLayer = getLayer;
    function getLayer() {
        let zoom = _.map.getZoom(),
            bounds = _.map.getBounds(),
            arrayZoom = _.countries[_.country].grid.arrayZoom,
            zoomKeys = Object.keys(arrayZoom),
            maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

        // Assign the table based on the zoom array.
        _.grid.table = zoom > maxZoomKey ?
            arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
                null : arrayZoom[zoom];

        // Initiate data request only if table and display are true.
        if (_.grid.table && _.grid.display) {

            dom.pages[1].style.display = 'block';
            dom.legend.style.opacity = 0;
            dom.container.style.marginLeft = '-50%';
            dom.pages[0].style.display = 'none';

            // Create and open grid.xhr
            _.grid.xhr = new XMLHttpRequest();
            _.grid.xhr.open('GET', localhost + 'q_grid?' + helper.paramString({
                c: dom.selSize.selectedOptions[0].value,
                v: dom.selColor.selectedOptions[0].value,
                database: _.countries[_.country].grid.database,
                table: _.grid.table,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }));

            // Draw layer on load event.
            _.grid.xhr.onload = function () {
                if (this.status === 200) {

                    // Check for existing layer and remove from map.
                    if (_.grid.layer) _.map.removeLayer(_.grid.layer);

                    // Add geoJSON feature collection to the map.
                    _.grid.layer = new L.geoJson(processGrid(JSON.parse(this.responseText)), {
                        pointToLayer: function (feature, latlng) {

                            // Set size dependent on the location count against arraySize.
                            let size =
                                feature.properties.c < _.grid.arraySize[1] ? 6 :
                                    feature.properties.c < _.grid.arraySize[2] ? 8 :
                                        feature.properties.c < _.grid.arraySize[3] ? 10 :
                                            feature.properties.c < _.grid.arraySize[4] ? 12 :
                                                feature.properties.c < _.grid.arraySize[5] ? 14 :
                                                    feature.properties.c < _.grid.arraySize[6] ? 16 :
                                                    18;

                            let dot =
                                feature.properties.v < _.grid.arrayColor[1] ? svg_symbols.dot(_.grid.colorScale[0]) :
                                    feature.properties.v < _.grid.arrayColor[2] ? svg_symbols.dot(_.grid.colorScale[1]) :
                                        feature.properties.v < _.grid.arrayColor[3] ? svg_symbols.dot(_.grid.colorScale[2]) :
                                            feature.properties.v < _.grid.arrayColor[4] ? svg_symbols.dot(_.grid.colorScale[3]) :
                                                feature.properties.v < _.grid.arrayColor[5] ? svg_symbols.dot(_.grid.colorScale[4]) :
                                                    feature.properties.v < _.grid.arrayColor[6] ? svg_symbols.dot(_.grid.colorScale[5]) :
                                                        feature.properties.v < _.grid.arrayColor[7] ? svg_symbols.dot(_.grid.colorScale[6]) :
                                                        svg_symbols.dot(_.grid.colorScale[6]);

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

                    _.grid.layer.addTo(_.map);
                    _.locale.layersCheck('grid', true);

                    svg_legends.createGridLegend(_.grid, dom);
                }
            };
            _.grid.xhr.send();
            _.locale.layersCheck('grid', false);

        } else {
            _.locale.layersCheck('grid', null);
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

        let min = helper.getMath(data, 3, 'min'),
            max = helper.getMath(data, 3, 'max'),
            avg = avg_c / dots.features.length,
            step_lower = (avg - min) / 4,
            step_upper = (max - avg) / 3;

        _.grid.arraySize = [];
        _.grid.arraySize[0] = min;
        _.grid.arraySize[1] = min + step_lower;
        _.grid.arraySize[2] = min + (step_lower * 2);
        _.grid.arraySize[3] = min + (step_lower * 3);
        _.grid.arraySize[4] = avg;
        _.grid.arraySize[5] = avg + step_upper;
        _.grid.arraySize[6] = avg + (step_upper * 2);
        _.grid.arraySize[7] = max;

        if (avg_v > 0) {
            min = helper.getMath(data, 4, 'min');
            max = helper.getMath(data, 4, 'max');
            avg = avg_v / dots.features.length;
            step_lower = (avg - min) / 4;
            step_upper = (max - avg) / 3;
            _.grid.arrayColor = [];
            _.grid.arrayColor[0] = min;
            _.grid.arrayColor[1] = min + step_lower;
            _.grid.arrayColor[2] = min + (step_lower * 2);
            _.grid.arrayColor[3] = min + (step_lower * 3);
            _.grid.arrayColor[4] = avg;
            _.grid.arrayColor[5] = avg + step_upper;
            _.grid.arrayColor[6] = avg + (step_upper * 2);
            _.grid.arrayColor[7] = max;
        }
        return dots
    }

    _.grid.statFromGeoJSON = function (feature) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_grid_info');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                feature.infoj = JSON.parse(this.response);
                _.analyse.addFeature(feature);
            }
        }
        xhr.send(JSON.stringify({
            infoj: _.countries[_.country].grid.infoj,
            database: _.countries[_.country].grid.database,
            geometry: feature.geometry
        }));
    }
};