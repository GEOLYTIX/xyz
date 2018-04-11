const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

function getLayer() {

    let layer = this;

    if (layer.display) {
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest();

        // Build xhr request.
        let bounds = _xyz.map.getBounds();
        layer.xhr.open('GET', host + 'q_cluster?' + utils.paramString({
            dbs: layer.dbs,
            table: layer.table,
            qID: layer.qID,
            geom: layer.geom || 'geom',
            cat: layer.cluster_cat,
            kmeans: layer.cluster_kmeans,
            dbscan: layer.cluster_dbscan,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        }));

        layer.xhr.onload = function () {
            if (this.status === 200 && layer.display && layer.locale === _xyz.locale) {

                // Create cluster object from parsing the response text.
                let cluster = JSON.parse(this.responseText);

                // Filter out cluster values which are in the filter array.
                if (layer.style.categorized && layer.style.categorized.filter.length > 0) {
                    cluster = cluster.filter(c => {
                        Object.keys(c.properties.infoj).map(key => {
                            if (layer.style.categorized.filter.indexOf(key) >= 0) {
                                c.properties.count -= c.properties.infoj[key];
                                delete c.properties.infoj[key];
                            }
                        });
                        if (c.properties.count > 0) return c
                    });
                }

                // Filter out all values which are not in the cat array if filterOther is true.
                if (layer.style.categorized && layer.style.categorized.filterOther) {
                    cluster = cluster.filter(c => {
                        Object.keys(c.properties.infoj).map(key => {
                            if (!layer.style.categorized.cat[key]) {
                                c.properties.count -= c.properties.infoj[key];
                                delete c.properties.infoj[key];
                            }
                        });
                        if (c.properties.count > 0) return c
                    });
                }

                // get max count value for size control
                let max = cluster.reduce((max, c) => Math.max(max, c.properties.count), 0);
           
                // add layer
                if (layer.L) _xyz.map.removeLayer(layer.L);
                layer.L = L.geoJson(cluster, {
                    pointToLayer: (point, latlng) => {
                        
                        let icon;

                        // if (Object.keys(point.properties.infoj).length > 1) {

                        //     let dotArr;
                        //     if (layer.style.categorized && layer.style.categorized.competitors){
    
                        //         let vArr = [];

                        //         for (let iComp = 0; iComp < layer.style.categorized.competitors.length || 0; iComp++) {
                        //             vArr.push(point.properties.infoj[layer.style.categorized.competitors[iComp][0]] || 0);
                        //         }
    
                        //         dotArr = [400, layer.style.markerMulti[1]];

                        //         let vTot = 0;
                        //         for (let i = 0; i < vArr.length; i++) {
                        //             vTot += vArr[i];
                        //             if (vArr[i] > 0) {
                        //                 dotArr.splice(2,0,400 * vTot / point.properties.count);
                        //                 dotArr.splice(3,0,layer.style.categorized.competitors[i][1]);
                        //             }
                        //         }

                        //     }

                        //     icon = (dotArr || layer.style.markerMulti) ?
                        //         svg_symbols.target(dotArr || layer.style.markerMulti) :
                        //         layer.style.marker;

                        // } else {

                        //     icon = layer.style.categorized && layer.style.categorized.cat[Object.keys(point.properties.infoj)[0]] ?
                        //         layer.style.categorized.cat[Object.keys(point.properties.infoj)[0]].marker :
                        //         layer.style.marker || svg_symbols.target([400, '#090']);
                        // }

                        icon = svg_symbols.target([400,'#aaa']);

                        // for (let i = 0; i < layer.style.graduated.cat.length; i++) {

                        //     if (point.properties.infoj < layer.style.graduated.cat[i].val) break;

                        //     icon = layer.style.graduated.cat[i].marker;

                        // }

                        return L.marker(latlng, {
                            pane: layer.pane[0],
                            zIndexOffset: parseInt(1000 - 1000 / max * point.properties.count),
                            icon: L.icon({
                                iconUrl: icon,
                                iconSize: point.properties.count === 1 ? (layer.style.markerMin || 20) : (layer.style.markerMin || 20) + (layer.style.markerMax || 40) / max * point.properties.count
                                //iconSize: 20 + 40 / Math.log(max) * Math.log(point.properties.c)
                            })
                        });
                    }
                })
                    .on('click', function (e) {
                        let infoj = e.layer.feature.properties.infoj,
                            count = e.layer.feature.properties.infoj.length,
                            latlng = e.layer.feature.geometry.coordinates.reverse();

                        if (count === 1) {
                            _xyz.select.selectLayerFromEndpoint({
                                layer: layer.layer,
                                table: layer.table,
                                id: infoj[0].id,
                                marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                            });
                        }

                        if (count > 1) {

                            // Draw a cirle marker
                            layer.layerSelectionCell = L.circleMarker(latlng, {
                                radius: 30,
                                fillColor: '#ccff90',
                                fillOpacity: 0.4,
                                stroke: false,
                                interactive: false,
                                pane: layer.pane[0]
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
                                layer.popup = L.popup()
                                    .setLatLng(latlng)
                                    .setContent('<div class="scrollbar_container"><div class="scrollbar"></div></div><div class="content location_table">' + table + '</div>')
                                    .openOn(_xyz.map);
                                require('./lscrolly')(document.querySelector('.leaflet-popup-content'));

                                // Button to close popup.
                                _xyz.map.on('popupclose', function () {
                                    if (layer.layerSelectionCell) _xyz.map.removeLayer(layer.layerSelectionCell);
                                });
                            }

                            if (view_mode === 'mobile') {
                                // Remove the line marker which connects the cell with the drop down list;
                                if (layer.layerSelectionLine) _xyz.map.removeLayer(layer.layerSelectionLine);

                                let dom = {
                                    map: document.getElementById('map'),
                                    location_drop: document.querySelector('.location_drop'),
                                    location_drop__close: document.querySelector('.location_drop__close'),
                                    location_table: document.querySelector('.location_table'),
                                    map_button: document.querySelector('.map_button')
                                };
                                dom.location_table.innerHTML = table;
                                dom.map_button.style['display'] = 'none';
                                dom.location_drop.style['display'] = 'block';

                                // Pan map according to the location of the cluster cell;
                                let map_dom__height = dom.map.clientHeight,
                                    map_dom__margin = parseInt(dom.map.style.marginTop),
                                    shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(dom.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);

                                // _xyz.map.setZoomAround(e.latlng, _xyz.map.getZoom() + 1, { animate: false });
                                _xyz.map.panBy([0, -shiftY]);

                                // Draw line marker which connects hex cell with drop down.
                                layer.layerSelectionLine = L.marker(e.latlng, {
                                    icon: L.icon({
                                        iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
                                        iconSize: [3, 1000],
                                        iconAnchor: [2, 1000]
                                    })
                                }).addTo(_xyz.map);

                                // Button event to close the .location_drop.
                                dom.location_drop__close.addEventListener('click', function () {
                                    if (layer.layerSelectionCell) _xyz.map.removeLayer(layer.layerSelectionCell);
                                    if (layer.layerSelectionLine) _xyz.map.removeLayer(layer.layerSelectionLine);

                                    _xyz.map.panBy([0, parseInt(dom.location_drop.clientHeight) / 2]);

                                    dom.location_drop.style['display'] = 'none';
                                    dom.map_button.style['display'] = 'block';
                                });
                            }

                            // Zoom in one step.
                            // _xyz.map.setZoomAround(latlng, _xyz.map.getZoom() + 1);

                            // Add event to query location info to the location list records.
                            let location_table_rows = document.querySelectorAll('.location_table tr');

                            for (let i = 0; i < location_table_rows.length; i++) {
                                location_table_rows[i].addEventListener('click', function () {
                                    _xyz.select.selectLayerFromEndpoint({
                                        layer: layer.layer,
                                        table: layer.table,
                                        id: this.dataset.id,
                                        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                                    });
                                });
                            }

                        }
                    })
                    .on('mouseover', function (e) {
                        e.layer.setIcon(L.icon({
                            iconUrl: e.layer.options.icon.options.iconUrl,
                            iconSize: e.layer.options.icon.options.iconSize,
                            shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%221000%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22500%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
                            shadowSize: e.layer.options.icon.options.iconSize + 20,
                        }));
                    })
                    .on('mouseout', function (e) {
                        e.layer.setIcon(L.icon({
                            iconUrl: e.layer.options.icon.options.iconUrl,
                            iconSize: e.layer.options.icon.options.iconSize
                        }));
                    })
                    .addTo(_xyz.map);

                layer.loader.style.display = 'none';
                layer.loaded = true;
                _xyz.layersCheck();


            } else {

                // Status 204. No features returned.
                if (layer.L) _xyz.map.removeLayer(layer.L);
                layer.loader.style.display = 'none';
                layer.loaded = true;
                _xyz.layersCheck();
            }
        }
        layer.xhr.send();
    }
}

module.exports = {
    getLayer: getLayer
}