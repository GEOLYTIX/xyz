const L = require('leaflet');
const helper = require('./helper');
const grid = require('./grid_tools');
const svg_legends = require('./svg_legends');
const d3 = require('d3');

module.exports = function (_this) {
    let dom = {};
    _this.grid.dom = dom;
    dom.map = document.getElementById('map');
    dom.container = document.querySelector('#grid_module > .swipe_container');
    dom.pages = document.querySelectorAll('#grid_module .page_content');
    dom.pages_ = document.querySelectorAll('#grid_module .swipe_page');
    dom.legend = document.querySelector('#grid_module .legend');
    dom.btnDisplay = document.querySelector('#grid_module .btnDisplay');
    dom.btnOff = document.querySelector('#grid_module .btnOff');
    dom.selSize = document.querySelector('#grid_module .selSize');
    dom.selColor = document.querySelector('#grid_module .selColor');
    dom.chkGridRatio = document.getElementById('chkGridRatio');

    // locale.grid is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.grid = function (change_country) {

        // Remove existing layer.
        if (_this.grid.layer) _this.map.removeLayer(_this.grid.layer);

        if (change_country) {
            _this.removeHook('qCount');
            _this.removeHook('qValue');
            _this.removeHook('grid_ratio');
            _this.removeHook('grid');
            //dom.legend.style.display = 'none';
            dom.pages[1].style.display = 'none';
            dom.container.style.marginLeft = '0';
        }

        setDropDown(_this.countries[_this.country].grid, dom.selSize, 'qCount');
        setDropDown(_this.countries[_this.country].grid, dom.selColor, 'qValue');

        function setDropDown(countrySettings, select, query) {

            // Populate select options
            countrySettings.queryFields.map(function (queryField) {
                select.appendChild(
                    helper.createElement('option', {
                        value: queryField[0],
                        textContent: queryField[1]
                    })
                );
            });

            // Set the selectIndex from hook.
            if (_this.hooks[query]) {
                countrySettings[query] = _this.hooks[query];
                select.selectedIndex = helper.getSelectOptionsIndex(select.options, _this.hooks[query]);
            } else {
                countrySettings[query] = countrySettings.queryFields[0][0];
            }

            // Set label text.
            //label.textContent = select.selectedOptions[0].innerText;

            // onchange event to set the hook and title.
            select.onchange = function () {
                //label.textContent = event.target.options[event.target.selectedIndex].text;
                countrySettings[query] = event.target.value;
                _this.setHook(query, countrySettings[query]);
            };
        }

        _this.grid.display = _this.hooks.grid || _this.grid.default;

        _this.grid.calcRatio = (_this.hooks.grid_ratio === 'true');
        dom.chkGridRatio.checked = _this.grid.calcRatio;

        getLayer();
    };
    _this.locale.grid();

    // Turn ON grid layer.
    dom.btnDisplay.addEventListener('click', function () {
        _this.setHook('grid', true);
        _this.grid.display = true;
        getLayer();
    });

    // Turn OFF grid layer.
    dom.btnOff.addEventListener('click', function () {
        if (_this.grid.layer) _this.map.removeLayer(_this.grid.layer);
        _this.removeHook('grid');
        _this.grid.display = false;
        //dom.legend.style.display = 'none';
        dom.pages[1].style.display = 'none';
        dom.container.style.marginLeft = '0';
    });

    // Display count / value of grid cells as ratio.
    dom.chkGridRatio.addEventListener('click', function () {
        _this.grid.calcRatio = this.checked;
        getLayer();
    });

    // Get location layer
    _this.grid.getLayer = getLayer;
    function getLayer() {
        let zoom = _this.map.getZoom(),
            arrayZoom = _this.countries[_this.country].grid.arrayZoom,
            zoomKeys = Object.keys(arrayZoom),
            maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

        // Assign the table based on the zoom array.
        _this.grid.table = zoom > maxZoomKey ?
            arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
                null : arrayZoom[zoom];

        // Initiate data request only if table and display are true.
        if (_this.grid.table && _this.grid.display) {

            // Create new grid.xhr
            _this.grid.xhr = new XMLHttpRequest();

            // Open & send grid.xhr.
            let bounds = _this.map.getBounds();

            _this.grid.xhr.open('GET', localhost + 'q_grid?' + helper.paramString({
                c: _this.countries[_this.country].grid.qCount,
                v: _this.countries[_this.country].grid.qValue,
                database: _this.countries[_this.country].grid.database,
                table: _this.grid.table,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }));

            // Draw layer on load event.
            _this.grid.xhr.onload = function () {
                if (this.status === 200) {

                    // Check for existing layer and remove from map.
                    if (_this.grid.layer) _this.map.removeLayer(_this.grid.layer);

                    // Add geoJSON feature collection to the map.
                    _this.grid.layer = new L.geoJson(grid.processGrid(_this.grid, JSON.parse(this.responseText)), {
                        pointToLayer: function (feature, latlng) {

                            // Set size dependent on the location count against arraySize.
                            let size =
                                feature.properties.c < _this.grid.arraySize[1] ? 6 :
                                    feature.properties.c < _this.grid.arraySize[2] ? 8 :
                                        feature.properties.c < _this.grid.arraySize[3] ? 10 :
                                            feature.properties.c < _this.grid.arraySize[4] ? 12 :
                                                feature.properties.c < _this.grid.arraySize[5] ? 14 :
                                                    feature.properties.c < _this.grid.arraySize[6] ? 16 : 18;

                            let dot =
                                feature.properties.v < _this.grid.arrayColor[1] ? styleDot(_this.grid.colorScale[0]) :
                                    feature.properties.v < _this.grid.arrayColor[2] ? styleDot(_this.grid.colorScale[1]) :
                                        feature.properties.v < _this.grid.arrayColor[3] ? styleDot(_this.grid.colorScale[2]) :
                                            feature.properties.v < _this.grid.arrayColor[4] ? styleDot(_this.grid.colorScale[3]) :
                                                feature.properties.v < _this.grid.arrayColor[5] ? styleDot(_this.grid.colorScale[4]) :
                                                    feature.properties.v < _this.grid.arrayColor[6] ? styleDot(_this.grid.colorScale[5]) :
                                                        feature.properties.v < _this.grid.arrayColor[7] ? styleDot(_this.grid.colorScale[6]) : styleDot(_this.grid.colorScale[6]);


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

                    _this.grid.layer.addTo(_this.map);
                    _this.locale.layersCheck('grid', true);

                    //gridLegend();
                    svg_legends.createGridLegend(_this.grid);

                        //     setTimeout(function () {
    //         dom.legend.style['opacity'] = 1;
    //     }, 300);
    //     dom.pages[1].style.display = 'block';
    //     dom.container.style.marginLeft = '-50%';

                }
            };
            _this.grid.xhr.send();
            _this.locale.layersCheck('grid', false);

        } else {

            // Set the layersCheck for the vector
            _this.locale.layersCheck('grid', null);
        }
    }

    function styleDot(hex) { // set grid dot style
        let color = d3.rgb(hex), darker = color.darker(0.5),
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            dot = document.createElement("circle"), shade = document.createElement("circle");

        svg.setAttribute("width", 866);
        svg.setAttribute("height", 1000);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        shade.setAttribute("cx", 466);
        shade.setAttribute("cy", 532);
        shade.setAttribute("r", 395);
        shade.style.fill = darker;

        dot.setAttribute("cx", 400);
        dot.setAttribute("cy", 468);
        dot.setAttribute("r", 395);
        dot.style.fill = color;

        svg.appendChild(shade)
        svg.appendChild(dot);

        return ("data:image/svg+xml," + encodeURIComponent(svg.outerHTML));
    }

    _this.grid.statFromGeoJSON = function (feature) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_grid_info');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                feature.infoj = JSON.parse(this.response);
                _this.analyse.addFeature(feature);
            }
        }
        xhr.send(JSON.stringify({
            infoj: _this.countries[_this.country].grid.infoj,
            database: _this.countries[_this.country].grid.database,
            geometry: feature.geometry
        }));
    }
};