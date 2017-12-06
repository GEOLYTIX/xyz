const L = require('leaflet');
const helper = require('./helper');
const grid = require('./grid_tools');
const svg_builder = require('./svg_builder');

module.exports = function (_this) {

    // locale.location is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.location = function (change_country) {
        
        // Remove existing layer and layerSelection.
        if (_this.location.layer) _this.map.removeLayer(_this.location.layer);
        if (_this.location.layerSelection) _this.map.removeLayer(_this.location.layerSelection);
        if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
        if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);

        // Check for location display hook.
        if (_this.hooks.location || _this.location.default) {
            toggleLocationLayer(true);
        } else {
            _this.location.display = false;
        }

        // Remove the location_id hook when country is changed or select feature if hook exists
        if (change_country) {
            _this.removeHook('location_id');
            _this.location.container.style['marginLeft'] = '0';
            _this.location.infoTable.innerHTML = '';
        } else if (_this.hooks.location_id) {
            selectLayer(_this.hooks.location_id);
        }
    };
    _this.locale.location();

    // Toogle visibility of the location layer.
    document.getElementById('btnLocation--toggle').addEventListener('click', toggleLocationLayer);

    // Toggle location layer function turns location on with override === true.
    function toggleLocationLayer(override){
        let btn = document.getElementById('btnLocation--toggle');
        helper.toggleClass(btn, 'on');
        if (_this.location.display === false || override === true) {
            _this.location.display = true;
            btn.innerHTML = 'Turn locations off';
            _this.setHook('location', true);
            getLayer();
            
        } else {
            _this.location.display = false;
            btn.innerHTML = 'Turn locations on';
            _this.removeHook('location');
            if (_this.location.layer) _this.map.removeLayer(_this.location.layer);
            _this.locale.layersCheck('location', null);
        }
    }

    document.getElementById('btnZoomLoc').addEventListener('click', function(){
        _this.map.closePopup(_this.location.popup);
        _this.map.flyToBounds(_this.location.layerSelection.getBounds());
        // _this.map.fitBounds(_this.location.layerSelection.getBounds());

        if (view_mode === 'mobile') {
            if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
            if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);

            if (_this.location.location_drop.style['display'] === 'block'){
                _this.map.panBy([0, parseInt(_this.location.location_drop.clientHeight) / 2]);
                _this.location.location_drop.style['display'] = 'none';
            }

            document.querySelector('.map_button').style['display'] = 'block';
        }
    });   

    // Unselect location, clear info, remove hook and set container marginLeft to 0.
    document.getElementById('btnLocation--off').addEventListener('click', function(){
        if (_this.location.layerSelection) _this.map.removeLayer(_this.location.layerSelection);
        _this.removeHook('location_id');
        _this.locale.layersCheck('locationSelect', null);
        
        // Reset module panel
        _this.location.container.style['marginLeft'] = '0';
        _this.location.infoTable.innerHTML = '';
    });


    // Get location layer
    _this.location.getLayer = getLayer;
    function getLayer() {
        let zoom = _this.map.getZoom(),
            arrayZoom = _this.countries[_this.country].location.arrayZoom,
            zoomKeys = Object.keys(arrayZoom),
            maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

        // Assign the table based on the zoom array.
        _this.location.table = zoom > maxZoomKey ?
            arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
                null : arrayZoom[zoom];

        // Initiate data request only if table and display are true.
        if (_this.location.table && _this.location.display) {

            // Create new location.xhr
            _this.location.xhr = new XMLHttpRequest();

            // Open & send location.xhr.
            let bounds = _this.map.getBounds();
            _this.location.xhr.open('GET', localhost + 'q_grid?' + helper.paramString({
                c: _this.countries[_this.country].location.qCount,
                v: _this.countries[_this.country].location.qValue,
                id: _this.countries[_this.country].location.qID || null,
                table: _this.location.table,
                database: _this.countries[_this.country].location.database,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth()
            }));

            // Draw layer on load event.
            _this.location.xhr.onload = function () {
                if (this.status === 200) {

                    // Process results from backend in grid module.
                    let dots = grid.processGrid(_this.location, JSON.parse(this.responseText));

                    // Check for existing layer and remove from map.
                    if (_this.location.layer) _this.map.removeLayer(_this.location.layer);

                    // Add geoJSON feature collection to the map.
                    _this.location.layer = new L.geoJson(dots, {
                        pointToLayer: function (feature, latlng) {

                            // Set size dependent on the location count against arraySize.
                            let size =
                                feature.properties.c < _this.location.arraySize[1] ? 14 :
                                    feature.properties.c < _this.location.arraySize[2] ? 16 :
                                        feature.properties.c < _this.location.arraySize[3] ? 18 :
                                            feature.properties.c < _this.location.arraySize[4] ? 20 :
                                                feature.properties.c < _this.location.arraySize[5] ? 22 :
                                                    feature.properties.c < _this.location.arraySize[6] ? 24 :
                                                        feature.properties.c < _this.location.arraySize[7] ? 28 :
                                                            feature.properties.c < _this.location.arraySize[8] ? 32 :
                                                                36;

                            // Split the feature value and create svg for competitive locations. Display svg from arrayStyle for locations with one store only.
                            let dot,
                                vArr = feature.properties.v.split(',');
                            if (vArr.length === 1) {
                                dot = _this.countries[_this.country].location.arrayStyle[vArr[0]] || _this.countries[_this.country].location.arrayStyle['other'];

                            } else {
                                let dotArr = [[400, _this.countries[_this.country].location.arrayCompColours[0]]];
                                for (let i = 0; i < vArr.length - 1; i++) {
                                    let vTot = 0;
                                    for (let ii = i; ii < vArr.length - 1; ii++) {
                                        vTot += parseInt(vArr[ii])
                                    }
                                    dotArr.push([400 * vTot / feature.properties.c, _this.countries[_this.country].location.arrayCompColours[i + 1]]);
                                }
                                dot = svg_builder(dotArr);
                            }

                            // Return L.Marker with icon as style to pointToLayer.
                            return L.marker(
                                latlng,
                                {
                                    icon: L.icon({
                                        iconUrl: dot,
                                        iconSize: size
                                    }),
                                    pane: 'location',
                                    interactive: true
                                });
                        },
                        onEachFeature: function (feature, layer) {
                            layer.on({

                                // Mouseover event displays a light green shadow under the circle symbol for the location.
                                mouseover: function () {
                                    this.setIcon(L.icon({
                                        iconUrl: this.options.icon.options.iconUrl,
                                        iconSize: this.options.icon.options.iconSize,
                                        shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%22866%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22433%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
                                        shadowSize: this.options.icon.options.iconSize + 20,
                                    }));
                                },

                                // Mouseout event sets the icon to be the original item without the shadow definition.
                                mouseout: function () {
                                    this.setIcon(L.icon({
                                        iconUrl: this.options.icon.options.iconUrl,
                                        iconSize: this.options.icon.options.iconSize
                                    }));
                                },

                                // Click event will query clustered features or directly display the features info for a single feature.
                                click: function (e) {
                                    if (this.feature.properties.c > 1) {
                                        getLocations(e, this.feature);
                                    } else {
                                        selectLayer(this.feature.properties.id);
                                    }
                                }
                            })
                        }
                    }).addTo(_this.map);
                    _this.locale.layersCheck('location', true);
                }
            };
            _this.location.xhr.send();
            _this.locale.layersCheck('location', false);

        } else {

            // Set the layersCheck
            _this.locale.layersCheck('location', null);
        }
    }


    // Select a location layer.
    _this.location.selectLayer = selectLayer;
    function selectLayer(id) {

        // Create new xhr for /q_location_info?
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_location_info?' + helper.paramString({
            qid: _this.countries[_this.country].location.qID,
            id: id.toString().split('.')[1] || id,
            layer: _this.countries[_this.country].location.qLayer,
            vector: _this.countries[_this.country].location.qVector || null
        }));

        // Display the selected layer feature on load event.
        xhr.onload = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText),
                    geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj);

                // Remove layerSelection from map if exists.
                if (_this.location.layerSelection) _this.map.removeLayer(_this.location.layerSelection);

                // Create layerSelection from geoJSON and add to map.
                _this.location.layerSelection = L.geoJson(
                    {
                        'type': 'Feature',
                        'geometry': geomj
                    }, {
                        pane: 'locationSelection',
                        pointToLayer: function (feature, latlng) {
                            return new L.Marker(latlng, {
                                icon: L.icon({
                                    iconUrl: _this.location.marker,
                                    iconSize: [80, 40],
                                    iconAnchor: [40, 40]
                                }),
                                interactive: false
                            });
                        }
                    }).addTo(_this.map);
                    _this.locale.layersCheck('locationSelect', true);

                // Select the associated vector layer
                if (_this.vector.display && json[0].vector) _this.vector.selectLayer(json[0].vector);

                // Assign info fields to info table.
                let table = '';
                Object.keys(infoj).map(function (key) {
                    let info_field = key.substring(0,6) === 'empty_' ? '' : key;
                    if (infoj[key] !== null) table += '<tr><td>' + info_field + '</td><td>' + infoj[key] + '</td></tr>';
                });

                // Opacity is set to transition at 300ms for .location_info in _location.scss. Assign info table to location_info dom.
                _this.location.infoTable.style['opacity'] = 0;
                setTimeout(function(){
                    _this.location.infoTable.innerHTML = table;
                    _this.location.infoTable.style['opacity'] = 1;
                }, 300);
                _this.location.container.style['marginLeft'] = '-100%';

                // Add hook for the location
                _this.setHook('location_id', id);

                // Move info container up if display is mobile and info container is less than 200px in view.
                if (view_mode === 'mobile' && document.querySelector('html, body').scrollTop < 200){
                    document.querySelector('html, body').scrollTop = 200;
                }
            }
        };
        xhr.send();
        _this.locale.layersCheck('locationSelect', false);

    }

    // Get a list of locations from a cluster(cell).
    function getLocations(e, cell) {

        // Create new xhr for /q_location?
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_location?' + helper.paramString({
            layer: _this.countries[_this.country].location.qLayer,
            label: _this.countries[_this.country].location.qLabel,
            qid: _this.countries[_this.country].location.qID,
            grid_id: cell.properties.id
        }));

        // Display the cluster cell and list locations.
        xhr.onload = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);

                // Populate a html table with the location list results.
                let table = '<table cellpadding="0" cellspacing="0">';
                for (let i = 0; i < json.loc.length; i++) {
                    table += '<tr data-id="'+ json.loc[i].id +'"><td>'
                        + json.loc[i].label + '</td></tr>';
                }
                table += '</table>';

                // Get the selection latLng and draw the hex cluster cell.
                let geomj = JSON.parse(json.cell),
                    latLng = [geomj.coordinates[0][3][1],geomj.coordinates[0][3][0]];

                if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
                _this.location.layerSelectionCell = L.geoJson(
                    {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': geomj
                    }, {
                        style: {
                            fillColor: '#ccff90',
                            fillOpacity: 0.4,
                            stroke: false
                        },
                        interactive: false
                    }).addTo(_this.map);

                if (view_mode === 'desktop') {

                    // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
                    _this.location.popup = L.popup()
                        .setLatLng(latLng)
                        .setContent('<div class="scrollbar_container"><div class="scrollbar"></div></div><div class="content location_table">' + table + '</div>')
                        .openOn(_this.map);
                    require('./lscrolly')(document.querySelector('.leaflet-popup-content'));

                    // Button to close popup.
                    _this.map.on('popupclose', function(){
                        if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
                    });

                    // Zoom in one step.
                    _this.map.setZoomAround(latLng, _this.map.getZoom() + 1);
                }

                if (view_mode === 'mobile') {

                    // Remove the line marker which connects the hex cell with the drop down list;
                    if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);

                    // Populate and display the .location_drop with the location list table.
                    document.querySelector('.location_table').innerHTML = table;
                    document.querySelector('.map_button').style['display'] = 'none';
                    _this.location.location_drop.style['display'] = 'block';

                    // Pan map according to the location of the cluster cell;
                    let map_dom = document.getElementById('map'),
                        map_dom__height = map_dom.clientHeight,
                        map_dom__margin = parseInt(map_dom.style.marginTop),
                        shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(_this.location.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);
                    _this.map.setZoomAround(latLng, _this.map.getZoom() + 1, {animate: false});
                    _this.map.panBy([0, -shiftY]);

                    // Draw line marker which connects hex cell with drop down.
                    _this.location.layerSelectionLine = L.marker(latLng, {
                        icon: L.icon({
                            iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
                            iconSize: [3, 1000],
                            iconAnchor: [2, 1000]
                        })
                    }).addTo(_this.map);

                    // Button event to close the .location_drop.
                    document.querySelector('.location_drop__close').addEventListener('click', function(){
                        if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
                        if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);
                        _this.map.panBy([0, parseInt(_this.location.location_drop.clientHeight) / 2]);
                        _this.location.location_drop.style['display'] = 'none';
                        document.querySelector('.map_button').style['display'] = 'block';
                    });
                }

                // Add event to query location info to the location list records.
                let location_table_rows = document.querySelectorAll('.location_table tr');
                for (let i = 0; i < location_table_rows.length; i++) {
                    location_table_rows[i].addEventListener('click', function () {
                        selectLayer(this.dataset.id);
                    });
                }
            }
        };
        xhr.send();
    }
};