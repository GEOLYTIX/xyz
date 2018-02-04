const utils = require('./utils');
const svg_legends = require('./svg_legends');
const svg_symbols = require('./svg_symbols');

const d3 = require('d3');

function getLayer() {

    if (this.display) {
        this.loaded = false;
        this.xhr = new XMLHttpRequest(); 

        let layer = this,
            bounds = _xyz.map.getBounds();

        this.xhr.open('GET', localhost + 'q_cluster?' + utils.paramString({
            layer: this.qTable,
            qid: this.qID,
            label: this.qLabel,
            brand: this.qBrand,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth(),
            dist: getDistance(this)
        }));

        // Get clustering distance from settings based on zoom level
        function getDistance(layer) {
            let z = _xyz.map.getZoom(),
                len = Object.keys(layer.clusterDistance).length,
                min = Object.keys(layer.clusterDistance)[0],
                max = Object.keys(layer.clusterDistance)[len - 1],
                dist = z < parseInt(min) ?
                    min : z > parseInt(max) ?
                        max : z.toString();

            return layer.clusterDistance[dist];
        }

        this.xhr.onload = function () {
            if (this.status === 200) {
                let data = JSON.parse(this.responseText),
                    places = {
                        type: 'Feature Collection',
                        //features: []
                        features: data
                    };

                // Object.keys(data).map(function (key) {
                //     places.features.push({
                //         type: 'Feature',
                //         geometry: JSON.parse(data[key].geomj),
                //         properties: {
                //             infoj: data[key].infoj
                //         }
                //     });
                // });

                // break into classes
                // layer.arrayMarker = breakdownClasses(places.features);
                let max = Math.max(...places.features.map(f => f.properties.c));
                

                // Get classes for clustering
                function breakdownClasses(features) {
                    let arrayMarker = [];
                    if (features.length) {
                        let vals = [];
                        for (let i = 0; i < features.length; i++) {
                            vals.push(features[i].properties.c);
                            //vals.push(features[i].properties.infoj.length);
                        }

                        let min = vals.reduce((a, b) => Math.min(a, b)),
                            max = vals.reduce((a, b) => Math.max(a, b)),
                            sum = vals.reduce((a, b) => a + b),
                            avg = sum / vals.length,
                            step_lower = (avg - min) / 3,
                            step_upper = (max - avg) / 4;

                        arrayMarker[0] = min;
                        arrayMarker[1] = min + step_lower;
                        arrayMarker[2] = min + 2 * step_lower;
                        arrayMarker[3] = avg;
                        arrayMarker[4] = avg + step_upper;
                        arrayMarker[5] = avg + 2 * step_upper;
                        arrayMarker[6] = avg + 3 * step_upper;
                        arrayMarker[7] = max;
                    }
                    return arrayMarker;
                }

                // add layer
                layer.L = L.geoJson(places, {
                    pointToLayer: function(point, latlng){

                        return L.circleMarker(latlng, {
                            radius: 5 + 30 / max * point.properties.c
                          });

                        // let icon,
                        //     count = point.properties.infoj.length;

                        // if (count > 1) {
                        //     let brandArr = [];
                        //     for (let i = 0; i < point.properties.infoj.length || 0; i++) {
                        //         brandArr.push(point.properties.infoj[i].brand);
                        //     }

                        //     let vArr = [0, 0, 0];
                        //     for (let i = 0; i < layer.competitors.length || 0; i++) {
                        //         for (let ii = 0; ii < brandArr.length; ii++) {
                        //             if (brandArr[ii] === layer.competitors[i]) {
                        //                 vArr[i]++;
                        //             }
                        //         }
                        //     }

                        //     let dotArr = [[400, layer.arrayCompColours[0]]];
                        //     for (let i = 0; i < vArr.length - 1; i++) {
                        //         let vTot = 0;
                        //         for (let ii = i; ii < vArr.length - 1; ii++) {
                        //             vTot += parseInt(vArr[ii])
                        //         }
                        //         dotArr.push([400 * vTot / count, layer.arrayCompColours[i + 1]]);
                        //     }
                
                        //     icon = svg_symbols.target(dotArr);

                        // } else {                           
                        //     icon = svg_symbols.target(layer.markerStyle[point.properties.infoj[0].brand].style || _xyz.layers.markerStyle);
                        // }

                        // return L.marker(latlng, {
                        //     icon: L.icon({
                        //         iconUrl: icon,
                        //         iconSize: getIconSize(count, layer)
                        //     })
                        // });

                        // Get icon size
                        function getIconSize(count, layer) {
                            let size = count === 1?
                                20 : count < layer.arrayMarker[1] ?
                                    25 : count < layer.arrayMarker[2] ?
                                        30 : count < layer.arrayMarker[3] ?
                                            35 : count < layer.arrayMarker[4] ?
                                                40 : count < layer.arrayMarker[5] ?
                                                    45 : count < layer.arrayMarker[6] ?
                                                        50 :
                                                        55;

                            return size;
                        }

                    }
                    //onEachFeature: _oef
                }).addTo(_xyz.map);

                if (!layer.legend) svg_legends.createClusterLegend(layer);

                // on each feature
                function _oef(feature, layer) {

                    function layerOnClick(e) {
                        let infoj = this.feature.properties.infoj,
                            count = this.feature.properties.infoj.length,
                            latlng = this.feature.geometry.coordinates.reverse();

                        console.log(infoj);

                        if (count > 1) {
                            // Draw a cirle marker
                            _xyz.layers.layers[_layer].layerSelectionCell = L.circleMarker(latlng, {
                                radius: 30,
                                fillColor: '#ccff90',
                                fillOpacity: 0.4,
                                stroke: false,
                                interactive: false
                            }).addTo(_xyz.map);

                            let table = '<table cellpadding="0" cellspacing="0">';

                            for (let i = 0; i < count && i < 100; i++) {
                                table += '<tr data-id="' + infoj[i].id + '"><td>'
                                    + infoj[i].label + '</td></tr>';
                            }
                            table += '</table>';

                            if (count > 100) table += '<caption><small>and ' + (count - 100).toString() + ' more.</small></caption>';

                            if (view_mode === 'desktop') {
                                // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
                                _xyz.layers.layers[_layer].popup = L.popup()
                                    .setLatLng(latlng)
                                    .setContent('<div class="scrollbar_container"><div class="scrollbar"></div></div><div class="content location_table">' + table + '</div>')
                                    .openOn(_xyz.map);
                                require('./lscrolly')(document.querySelector('.leaflet-popup-content'));

                                // Button to close popup.
                                _xyz.map.on('popupclose', function () {
                                    if (_xyz.layers.layers[_layer].layerSelectionCell) _xyz.map.removeLayer(_xyz.layers.layers[_layer].layerSelectionCell);
                                });
                            }

                            if (view_mode === 'mobile') {
                                // Remove the line marker which connects the cell with the drop down list;
                                if (_xyz.layers.layers[_layer].layerSelectionLine) _xyz.map.removeLayer(_xyz.layers.layers[_layer].layerSelectionLine);

                                // Populate and display the .location_drop with the location list table.
                                _xyz.layers.dom.locationTable.innerHTML = table;
                                _xyz.layers.dom.btnMap.style['display'] = 'none';
                                _xyz.layers.dom.location_drop.style['display'] = 'block';

                                // Pan map according to the location of the cluster cell;
                                let map_dom = _xyz.layers.dom.map,
                                    map_dom__height = map_dom.clientHeight,
                                    map_dom__margin = parseInt(map_dom.style.marginTop),
                                    shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(_xyz.layers.dom.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);

                                _xyz.map.setZoomAround(latLng, _xyz.map.getZoom() + 1, { animate: false });
                                _xyz.map.panBy([0, -shiftY]);

                                // Draw line marker which connects hex cell with drop down.
                                _xyz.layers.layers[_layer].layerSelectionLine = L.marker(latLng, {
                                    icon: L.icon({
                                        iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
                                        iconSize: [3, 1000],
                                        iconAnchor: [2, 1000]
                                    })
                                }).addTo(_xyz.map);

                                // Button event to close the .location_drop.
                                _xyz.layers.dom.locDropClose.addEventListener('click', function () {
                                    if (_xyz.layers.layers[_layer].layerSelectionCell) _xyz.map.removeLayer(_xyz.layers.layers[_layer].layerSelectionCell);
                                    if (_xyz.layers.layers[_layer].layerSelectionLine) _xyz.map.removeLayer(_xyz.layers.layers[_layer].layerSelectionLine);

                                    _xyz.map.panBy([0, parseInt(_xyz.layers.dom.location_drop.clientHeight) / 2]);

                                    _xyz.layers.dom.location_drop.style['display'] = 'none';
                                    _xyz.layers.dom.btnMap.style['display'] = 'block';
                                });
                            }
                            // Zoom in one step.
                            _xyz.map.setZoomAround(latlng, _xyz.map.getZoom() + 1);

                            // Add event to query location info to the location list records.
                            let location_table_rows = document.querySelectorAll('.location_table tr');

                            for (let i = 0; i < location_table_rows.length; i++) {
                                location_table_rows[i].addEventListener('click', function () {
                                    selectLayer(this.dataset.id);
                                });
                            }

                        } else {
                            selectLayer(infoj[0].id);

                        }
                    }

                    function layerOnMouseover() {
                        this.setIcon(L.icon({
                            iconUrl: this.options.icon.options.iconUrl,
                            iconSize: this.options.icon.options.iconSize,
                            shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%221000%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22500%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
                            shadowSize: this.options.icon.options.iconSize + 20,
                        }));
                    }

                    function layerOnMouseout() {
                        this.setIcon(L.icon({
                            iconUrl: this.options.icon.options.iconUrl,
                            iconSize: this.options.icon.options.iconSize
                        }));
                    }

                    layer.on({
                        click: layerOnClick,
                        mouseover: layerOnMouseover,
                        mouseout: layerOnMouseout
                    });
                }
            }
        }
        this.xhr.send();
    }


    function selectLayer(id) {

        let xhr = new XMLHttpRequest();

        let url = localhost + 'q_cluster_info?' + utils.paramString({
            qid: _xyz.countries[_xyz.country].layers[_layer].qID,
            id: id.toString().split('.')[1] || id,
            layer: _xyz.countries[_xyz.country].layers[_layer].qLayer,
            vector: _xyz.countries[_xyz.country].layers[_layer].qVector || null
        });

        xhr.open("GET", url);

        // Display the selected layer feature on load event.
        xhr.onload = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText),
                    geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj);

                // Remove layerSelection from map if exists.
                if (_xyz.layers.layers[_layer].layerSelection) _xyz.map.removeLayer(_xyz.layers.layers[_layer].layerSelection);

                // Create layerSelection from geoJSON and add to map.
                _xyz.layers.layers[_layer].layerSelection = L.geoJson({
                    'type': 'Feature',
                    'geometry': geomj
                }, {
                        pane: 'locationSelection',
                        pointToLayer: function (feature, latlng) {
                            return new L.Marker(latlng, {
                                icon: L.icon({
                                    iconUrl: _xyz.location.marker,
                                    iconSize: [80, 40],
                                    iconAnchor: [40, 40]
                                }),
                                interactive: false
                            });
                        }
                    }).addTo(_xyz.map);
                _xyz.layersCheck(_layer + '_select', true);

                // Select the associated vector layer
                if (_xyz.layers.layers['Postal codes'].display && json[0].layers) {
                    //selection not ready yet
                    _xyz.layers.selectLayer(json[0].layers);
                }

                // test select module
                if (_xyz.select) {


                    let feature = {};
                    feature.geometry = geomj;
                    feature.infoj = infoj;
                    console.log(feature);
                    _xyz.select.add(feature)
                };

                // Assign info fields to info table.
                let table = '';

                Object.keys(infoj).map(function (_key) {
                    let info_field = _key.substring(0, 6) === 'empty_' ? '' : _key;
                    if (infoj[_key] !== null) table += '<tr><td>' + info_field + '</td><td>' + infoj[_key] + '</td></tr>';
                });

                // log infoj
                setTimeout(function () {
                    console.log(infoj);
                }, 300);

                // Add hook for the location
                if (_xyz.hooks.selected) {
                    _xyz.hooks.selected = _xyz.pushHook(_xyz.hooks.selected.split(","), _xyz.respaceHook(_layer) + "." + id);
                } else {
                    _xyz.hooks.selected = _xyz.pushHook([], _xyz.respaceHook(_layer) + "." + id);
                }
                _xyz.setHook("selected", _xyz.hooks.selected);


                // Move info container up if display is mobile and info container is less than 200px in view.
                if (view_mode === 'mobile' && document.querySelector('html, body').scrollTop < 200) {
                    document.querySelector('html, body').scrollTop = 200;
                }
            }
        }
        xhr.send();
        _xyz.layersCheck(_layer + '_select', false);
    }

}

module.exports = {
    getLayer: getLayer
}