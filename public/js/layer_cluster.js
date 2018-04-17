const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

function getLayer() {

    // Load layer if display is true.
    if (this.display) return loadLayer(this);
}

function loadLayer(layer) {

    // Display loader animation.
    layer.loaded = false;
    layer.loader.style.display = 'block';

    // Create XHR for fetching data from middleware.
    layer.xhr = new XMLHttpRequest();

    // Get bounds for request.
    let bounds = _xyz.map.getBounds();

    // Build XHR request.
    layer.xhr.open('GET', host + 'q_cluster?' + utils.paramString({
        dbs: layer.dbs,
        table: layer.table,
        geom: layer.geom,
        cat: layer.cluster_cat,
        kmeans: layer.cluster_kmeans,
        dbscan: layer.cluster_dbscan,
        canvas: _xyz.map._container.clientWidth * _xyz.map._container.clientHeight,
        theme: layer.style.theme && layer.style.theme.type? layer.style.theme.type: 'undefined',
        filter: layer.style.theme && layer.style.theme.filter.length > 0? layer.style.theme.filter: 'undefined',
        filterOther: layer.style.theme && layer.style.theme.filterOther.length > 0? layer.style.theme.filterOther: 'undefined',
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
    }));

    // Process XHR onload.
    layer.xhr.onload = () => {

        // Status 204. No features returned.
        if (layer.xhr.status === 204) return loadLayer_complete(layer);

        // Data is returned and the layer is still current.
        if (layer.xhr.status === 200 && layer.display && layer.locale === _xyz.locale) return addClusterToLayer(JSON.parse(layer.xhr.responseText), layer);
    }

    // Send XHR to middleware.
    layer.xhr.send();
}

function loadLayer_complete(layer) {

    // Hide loader animation and run layers check.
    layer.loader.style.display = 'none';
    layer.loaded = true;
    return _xyz.layersCheck();
}

function addClusterToLayer(cluster, layer) {

    // Get max count in cluster.
    let c_max = cluster.reduce((c_max, f) => Math.max(c_max, f.properties.count), 0);

    // Remove existing layer from Leaflet.
    if (layer.L) _xyz.map.removeLayer(layer.L);

    // Add cluster as point layer to Leaflet.
    layer.L = L.geoJson(cluster, {
        pointToLayer: (point, latlng) => {

            // Set icon to default marker. 
            let icon = layer.style.marker || svg_symbols.target([400, '#aaa']);

            // Check whether layer has categorized theme.
            if (layer.style.theme && layer.style.theme.type === 'categorized' && Object.keys(point.properties.cat).length > 1) {

                let dotArr = [400, "#333"];

                if (layer.style.theme.competitors) {
                    let c = 0;
                    Object.keys(layer.style.theme.competitors).map(comp => {
                        if (point.properties.cat[comp]) {
                            c += point.properties.cat[comp];
                            dotArr.splice(2, 0, 400 * c / point.properties.count);
                            dotArr.splice(3, 0, layer.style.theme.competitors[comp].colour);
                        }
                    });

                }

                icon = svg_symbols.target(dotArr);
            }

            if (layer.style.theme && layer.style.theme.type === 'categorized' && Object.keys(point.properties.cat).length === 1) {
                icon = layer.style.theme.cat[Object.keys(point.properties.cat)[0]] ?
                    layer.style.theme.cat[Object.keys(point.properties.cat)[0]].marker : icon;
            }

            if (layer.style.theme && layer.style.theme.type === 'graduated') {
                for (let i = 0; i < layer.style.theme.cat.length; i++) {
                    if (point.properties.sum < layer.style.theme.cat[i].val) break;
                    icon = layer.style.theme.cat[i].marker;
                }
            }

            let iconSize = layer.markerLog.checked ?
                layer.style.markerMin + layer.style.markerMax / Math.log(c_max) * Math.log(point.properties.count) :
                point.properties.count === 1 ?
                    layer.style.markerMin :
                    layer.style.markerMin + layer.style.markerMax / c_max * point.properties.count;

            return L.marker(latlng, {
                pane: layer.pane[0],
                zIndexOffset: parseInt(1000 - 1000 / c_max * point.properties.count),
                icon: L.icon({
                    iconUrl: icon,
                    iconSize: iconSize
                })
            });
        }
    })
    .on('click', e => clusterMouseClick(e, layer))
    .addTo(_xyz.map);

    return loadLayer_complete(layer);

}

function clusterMouseOver(e) {
    e.layer.setIcon(L.icon({
        iconUrl: e.layer.options.icon.options.iconUrl,
        iconSize: e.layer.options.icon.options.iconSize,
        shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%221000%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22500%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
        shadowSize: e.layer.options.icon.options.iconSize + 20,
    }));
}

function clusterMouseOut(e) {
    e.layer.setIcon(L.icon({
        iconUrl: e.layer.options.icon.options.iconUrl,
        iconSize: e.layer.options.icon.options.iconSize
    }));
}

function clusterMouseClick(e, layer) {

    let count = e.layer.feature.properties.count,
        lnglat = e.layer.feature.geometry.coordinates;

        //latlng = e.layer.feature.geometry.coordinates.reverse();

    let xhr = new XMLHttpRequest();

    xhr.open('GET', host + 'q_cluster_select?' + utils.paramString({
        dbs: layer.dbs,
        table: layer.table,
        qID: layer.qID,
        label: layer.cluster_label,
        count: count,
        lnglat: lnglat
    }));

    xhr.onload = () => {

        console.log(JSON.parse(xhr.responseText));
        let cluster = JSON.parse(xhr.responseText);

        if (cluster.length === 1) {
            _xyz.select.selectLayerFromEndpoint({
                layer: layer.layer,
                table: layer.table,
                id: cluster[0].id,
                marker: cluster[0].lnglat
            });
        }

        if (cluster.length > 1) {

            let table = '<table cellpadding="0" cellspacing="0">';

            for (let i = 0; i < cluster.length && i < 100; i++) {
                table += '<tr '
                    + 'data-id="' + cluster[i].id + '" '
                    + 'data-marker="' + cluster[i].lnglat + '">'
                    + '<td>' + cluster[i].label + '</td>'
                    + '</tr>';
            }
            table += '</table>';

            //if (count > 100) table += '<caption><small>and ' + (count - 100).toString() + ' more.</small></caption>';

            if (view_mode === 'desktop') {

                // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
                layer.popup = L.popup()
                    .setLatLng(lnglat.reverse())
                    .setContent('<div class="scrollbar_container"><div class="scrollbar"></div></div><div class="content location_table">' + table + '</div>')
                    .openOn(_xyz.map);
                require('./lscrolly')(document.querySelector('.leaflet-popup-content'));

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

            // Add event to query location info to the location list records.
            let location_table_rows = document.querySelectorAll('.location_table tr');

            for (let i = 0; i < location_table_rows.length; i++) {
                location_table_rows[i].addEventListener('click', function () {
                    _xyz.select.selectLayerFromEndpoint({
                        layer: layer.layer,
                        table: layer.table,
                        id: this.dataset.id,
                        marker: this.dataset.marker.split(',')
                    });
                });
            }
        }
    }

    // Send XHR to middleware.
    xhr.send();
}

module.exports = {
    getLayer: getLayer
}