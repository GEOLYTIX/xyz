const L = require('leaflet');
const helper = require('./helper');
const grid = require('./grid_tools');
const svg_builder = require('./svg_builder');

// const turfTag = require('@turf/tag');
// const turfPlanePoint = require('@turf/planepoint');

module.exports = function(_this){

    // locale.grid is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.grid = function (change_country) {

        // Remove existing layer.
        if (_this.grid.layer) _this.map.removeLayer(_this.grid.layer);

        if (change_country) {
            _this.removeHook('qCount');
            _this.removeHook('qValue');
            _this.removeHook('grid_ratio');
            _this.removeHook('grid');
            _this.grid.legend.parentNode.style.display = 'none'; 
            _this.grid.container.style['marginLeft'] = '0';
        }

        let entries = '';
        Array.prototype.map.call(_this.countries[_this.country].grid.queryFields, function(field){
            entries += '<option value="' + field[0] + '">' + field[1] + '</option>';
        });

        setDropDown(document.getElementById('grid_size_select'), _this.grid.sizeTitle, 'qCount');
        setDropDown(document.getElementById('grid_colour_select'), _this.grid.colourTitle, 'qValue');

        function setDropDown(select, title, query) {

            // Populate the select drop down with entries html.
            select.innerHTML = entries;

            // Set the selectIndex from hook.
            if (_this.hooks[query]) {
                _this.countries[_this.country].grid[query] = _this.hooks[query];
                select.selectedIndex = getQueryIndex(_this.hooks[query]);
            } else {
                _this.countries[_this.country].grid[query] = _this.countries[_this.country].grid.queryFields[0][0];
            }
            title.innerHTML = select.selectedOptions[0].innerText;

            select.onchange = function () {
                title.innerHTML = event.target.options[event.target.selectedIndex].text;
                _this.countries[_this.country].grid[query] = event.target.value;
                _this.setHook(query, _this.countries[_this.country].grid[query]);
            };

            function getQueryIndex(id) {
                for (let i = 0; i < _this.countries[_this.country].grid.queryFields.length; i++) {
                    console.log(_this.countries[_this.country].grid.queryFields[i][0]);
                    if (_this.countries[_this.country].grid.queryFields[i][0] === id)
                        return i
                }
            }
        }

        _this.grid.display = _this.hooks.grid || _this.grid.default;
        _this.grid.calcRatio = (_this.hooks.grid_ratio === 'true');
        _this.grid.btnGridRatio.checked = _this.grid.calcRatio;
        getLayer();
    };
    _this.locale.grid();

    // Turn ON grid layer.
    document.getElementById('btnGrid--on').addEventListener('click', function(){
        _this.setHook('grid', true);
        _this.grid.display = true;
        getLayer();
    });

    // Turn OFF grid layer.
    document.getElementById('btnGrid--off').addEventListener('click', function () {
        if (_this.grid.layer) _this.map.removeLayer(_this.grid.layer);
        _this.removeHook('grid');
        _this.grid.display = false;
        _this.grid.legend.parentNode.style.display = 'none';
        _this.grid.container.style['marginLeft'] = '0';
    });

    // Display count / value of grid cells as ratio.
    _this.grid.btnGridRatio.addEventListener('click', function () {
        _this.grid.calcRatio = this.checked;
        this.checked === true ? _this.setHook('grid_ratio', this.checked) : _this.removeHook('grid_ratio');
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

            // console.log(localhost + 'q_grid?' + helper.paramString({
            //     c: _this.countries[_this.country].grid.qCount,
            //     v: _this.countries[_this.country].grid.qValue,
            //     database: _this.countries[_this.country].grid.database,
            //     table: _this.grid.table,
            //     west: bounds.getWest(),
            //     south: bounds.getSouth(),
            //     east: bounds.getEast(),
            //     north: bounds.getNorth()
            // }));

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

                    // Process results from backend in grid module.
                    //let dots = grid.processGrid(_this.grid, JSON.parse(this.responseText));

                    // Check for existing layer and remove from map.
                    if (_this.grid.layer) _this.map.removeLayer(_this.grid.layer);

                    // Add geoJSON feature collection to the map.
                    _this.grid.layer = new L.geoJson(grid.processGrid(_this.grid, JSON.parse(this.responseText)), {
                        pointToLayer: function (feature, latlng) {

                            // Set size dependent on the location count against arraySize.
                            let size =
                                feature.properties.c < _this.grid.arraySize[1] ? 7 :
                                    feature.properties.c < _this.grid.arraySize[2] ? 8 :
                                        feature.properties.c < _this.grid.arraySize[3] ? 9 :
                                            feature.properties.c < _this.grid.arraySize[4] ? 10 :
                                                feature.properties.c < _this.grid.arraySize[5] ? 11 :
                                                    feature.properties.c < _this.grid.arraySize[6] ? 12 :
                                                        feature.properties.c < _this.grid.arraySize[7] ? 14 :
                                                            feature.properties.c < _this.grid.arraySize[8] ? 16 :
                                                                18;

                            let dot =
                                feature.properties.v < _this.grid.arrayColor[1] ? _this.grid.arrayStyle[0] :
                                    feature.properties.v < _this.grid.arrayColor[2] ? _this.grid.arrayStyle[1] :
                                        feature.properties.v < _this.grid.arrayColor[3] ? _this.grid.arrayStyle[2] :
                                            feature.properties.v < _this.grid.arrayColor[4] ? _this.grid.arrayStyle[3] :
                                                feature.properties.v < _this.grid.arrayColor[5] ? _this.grid.arrayStyle[4] :
                                                    feature.properties.v < _this.grid.arrayColor[6] ? _this.grid.arrayStyle[5] :
                                                        feature.properties.v < _this.grid.arrayColor[7] ? _this.grid.arrayStyle[6] :
                                                            feature.properties.v < _this.grid.arrayColor[8] ? _this.grid.arrayStyle[7] :
                                                                feature.properties.v <= _this.grid.arrayColor[9] ? _this.grid.arrayStyle[8] :
                                                                    _this.grid.arrayStyle[9];


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
                    
                    gridLegend();
                    
                }
            };
            _this.grid.xhr.send();
            _this.locale.layersCheck('grid', false);

        } else {

            // Set the layersCheck for the vector 
            _this.locale.layersCheck('grid', null);
        }
    }

    function gridLegend(){
        let fractionDigits = _this.grid.calcRatio === true ? 2 : 0,
            fractionMinutes = _this.drivetime ?
                _this.drivetime.tin ? 1 / 60
                    : 1 : 1,
            legend_text_v = document.getElementsByClassName('legend_text_v'),
            legend_text_c = document.getElementsByClassName('legend_text_c');

        // Opacity is set to transition at 300ms for .grid_legend in _grid.scss.
        _this.grid.legend.parentNode.style.display = 'block';      
        _this.grid.legend.style['opacity'] = 0;

        // Label the grid cell values (color).
        legend_text_v[0].innerHTML = (_this.grid.arrayColor[1] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[1].innerHTML = (_this.grid.arrayColor[2] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[2].innerHTML = (_this.grid.arrayColor[3] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[3].innerHTML = (_this.grid.arrayColor[4] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[4].innerHTML = (_this.grid.arrayColor[5] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[5].innerHTML = (_this.grid.arrayColor[6] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[6].innerHTML = (_this.grid.arrayColor[7] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[7].innerHTML = (_this.grid.arrayColor[8] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});
        legend_text_v[8].innerHTML = (_this.grid.arrayColor[9] * fractionMinutes).toLocaleString('en-GB', {maximumFractionDigits: fractionDigits});

        // Label the grid cell count (size).
        legend_text_c[0].innerHTML = _this.grid.arraySize[9].toLocaleString('en-GB', {maximumFractionDigits: 0});
        legend_text_c[1].innerHTML = _this.grid.arraySize[5].toLocaleString('en-GB', {maximumFractionDigits: 0});
        legend_text_c[2].innerHTML = _this.grid.arraySize[0].toLocaleString('en-GB', {maximumFractionDigits: 0});

        setTimeout(function () {
            _this.grid.legend.style['opacity'] = 1;
        }, 300);
        _this.grid.container.style['marginLeft'] = '-100%';
    }
};