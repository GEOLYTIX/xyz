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
        layer.xhr.open('GET', localhost + 'q_cluster?' + utils.paramString({
            dbs: layer.dbs,
            layer: layer.table,
            qID: layer.qID,
            label: layer.cluster_label,
            competitor: layer.cluster_competitor,
            kmeans: layer.cluster_kmeans,
            dbscan: layer.cluster_dbscan,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        }));

        layer.xhr.onload = function () {
            if (this.status === 200) {
                let cluster = JSON.parse(this.responseText);

                // get max count value for size control
                //let max = Math.max(...places.features.map(f => f.properties.infoj.length));
                let max = cluster.reduce(function(max, c){
                    return Math.max(max, c.properties.infoj.length)
                }, cluster[0].properties.infoj.length);

                // places.features.sort((a, b) =>
                //     a.properties.infoj.length > b.properties.infoj.length ? -1 :
                //         a.properties.infoj.length < b.properties.infoj.length ? 1 : 0);

                // add layer
                if(layer.L) _xyz.map.removeLayer(layer.L);
                layer.L = L.geoJson(cluster, {
                    pointToLayer: function(point, latlng){
                        let icon,
                            count = point.properties.infoj.length;

                        if (count > 1) {
                            let competitorArr = [];
                            for (let i = 0; i < point.properties.infoj.length || 0; i++) {
                                competitorArr.push(point.properties.infoj[i].competitor);
                            }

                            let vArr = [0, 0, 0];
                            for (let i = 0; i < layer.competitors.length || 0; i++) {
                                for (let ii = 0; ii < competitorArr.length; ii++) {
                                    if (competitorArr[ii] === layer.competitors[i]) {
                                        vArr[i]++;
                                    }
                                }
                            }

                            let dotArr = [[400, layer.arrayCompColours[0]]];
                            for (let i = 0; i < vArr.length - 1; i++) {
                                let vTot = 0;
                                for (let ii = i; ii < vArr.length - 1; ii++) {
                                    vTot += parseInt(vArr[ii])
                                }
                                dotArr.push([400 * vTot / count, layer.arrayCompColours[i + 1]]);
                            }
                
                            icon = svg_symbols.target(dotArr);

                        } else {                           
                            icon = svg_symbols.target((layer.markerStyle[point.properties.infoj[0].competitor] && layer.markerStyle[point.properties.infoj[0].competitor].style) || layer.defaultMarker);
                        }

                        return L.marker(latlng, {
                            pane: layer.pane[0],
                            zIndexOffset: parseInt(1000 - 1000 / max * point.properties.infoj.length),
                            icon: L.icon({
                                iconUrl: icon,
                                iconSize: 20 + 40 / max * point.properties.infoj.length
                                //iconSize: 20 + 40 / Math.log(max) * Math.log(point.properties.c)
                            })
                        });
                    }
                })
                .on('click', function(e){
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
                .on('mouseover', function(e){
                    e.layer.setIcon(L.icon({
                        iconUrl: e.layer.options.icon.options.iconUrl,
                        iconSize: e.layer.options.icon.options.iconSize,
                        shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%221000%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22500%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
                        shadowSize: e.layer.options.icon.options.iconSize + 20,
                    }));
                })
                .on('mouseout', function(e){
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