const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = function() {

    // Load layer if display is true.
    if(this.display){

        if(this.arrayZoom){
            let zoom = global._xyz.map.getZoom(),
                zoomKeys = Object.keys(this.arrayZoom),
                maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
            
            this.table = zoom > maxZoomKey ?
                this.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
                    null : this.arrayZoom[zoom];
        }

        // Make drawer opaque if no table present.
        this.drawer.style.opacity = !this.table ? 0.4 : 1;

        if(this.table) return loadLayer(this);
    }
}

function loadLayer(layer) {

    // Display loader animation.
    layer.loaded = false;
    layer.loader.style.display = 'block';

    // Create XHR for fetching data from middleware.
    layer.xhr = new XMLHttpRequest();

    // Get bounds for request.
    let bounds = global._xyz.map.getBounds();
    
    // Build XHR request.
    layer.xhr.open('GET', global._xyz.host + '/api/cluster/get?' + utils.paramString({
        locale: _xyz.locale,
        layer: layer.layer,
        table: layer.table,
        kmeans: layer.cluster_kmeans,// * window.devicePixelRatio,
        dbscan: layer.cluster_dbscan,// * window.devicePixelRatio,
        theme: layer.style.theme && layer.style.theme.type ? layer.style.theme.type : null,
        cat: layer.style.theme && layer.style.theme.field ? layer.style.theme.field : null,
        size: layer.style.theme && layer.style.theme.size ? layer.style.theme.size : null,
        filter: JSON.stringify(layer.filter),
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
        token: global._xyz.token
    }));

    // Process XHR onload.
    layer.xhr.onload = e => {

        if (e.target.status === 401) {
            document.getElementById('timeout_mask').style.display = 'block';
            console.log(e.target.response);
            return loadLayer_complete(layer);
        }

        // Status 204. No features returned.
        if (e.target.status === 204) {
            if (layer.L) global._xyz.map.removeLayer(layer.L);
            return loadLayer_complete(layer);
        }

        // Data is returned and the layer is still current.
        if (e.target.status === 200 && layer.display && layer.locale === global._xyz.locale) return addClusterToLayer(JSON.parse(e.target.responseText), layer);
    }
    // Send XHR to middleware.
    layer.xhr.send();

}

function loadLayer_complete(layer) {

    // Hide loader animation and run layers check.
    layer.loader.style.display = 'none';
    layer.loaded = true;
    return global._xyz.layersCheck();
}

function addClusterToLayer(cluster, layer) {

    // Get max count in cluster.
    let c_max = cluster.reduce((c_max, f) => Math.max(c_max, f.properties.count), 0);

    let csize_max = layer.style.theme && layer.style.theme.size ?
        cluster.reduce((csize_max, f) => Math.max(c_max, f.properties.size), 0) : null;

    // Remove existing layer from Leaflet.
    if (layer.L) global._xyz.map.removeLayer(layer.L);

    // Add cluster as point layer to Leaflet.
    layer.L = L.geoJson(cluster, {

        pointToLayer: (point, latlng) => {
        
            // Set icon to default marker. 
            let marker_style = layer.style.marker ? layer.style.marker : {type: "target", style: [400, '#aaa']};

            let icon = svg_symbols.create(marker_style);

            // Set tooltip for desktop if corresponding layer has hover property.
            let tooltip = (layer.theme && layer.theme.hover && global._xyz.view_mode === 'desktop') || false;

            // Check whether layer has categorized theme and more than a single location in cluster.
            if (layer.style.theme && layer.style.theme.type === 'categorized' && Object.keys(point.properties.cat).length > 1) {

                // Define a default dotArr.
                let dotArr = layer.style.markerMulti.style instanceof Array ? utils.clone(layer.style.markerMulti.style) : [400, "#333"];

                if (layer.style.theme.competitors) {
                    let c = 0;
                    Object.keys(layer.style.theme.competitors).map(comp => {
                        if (point.properties.cat[comp]) {
                            c += point.properties.cat[comp];
                            dotArr.splice(2, 0, 400 * c / point.properties.count, layer.style.theme.competitors[comp].colour);
                        }
                    });
                }

                // Create icon svg from dotArr.
                icon = svg_symbols.create({type: "target", style: dotArr});
            }

            // Check whether layer has  categorized theme and only 1 location in cluster.
            if (layer.style.theme && layer.style.theme.type === 'categorized' && Object.keys(point.properties.cat).length === 1) {
                
                icon = layer.style.theme.cat[Object.keys(point.properties.cat)[0]] ?
                    svg_symbols.create(layer.style.theme.cat[Object.keys(point.properties.cat)[0]].marker) : icon;
                
            }

            // Graduated theme.
            if (layer.style.theme && layer.style.theme.type === 'graduated') {
                for (let i = 0; i < layer.style.theme.cat.length; i++) {
                    if (point.properties.sum < layer.style.theme.cat[i].val) break;
                    icon = svg_symbols.create(layer.style.theme.cat[i].marker);
                }

                // Set tooltip for graduated theme property (sum).
                tooltip = tooltip ? parseFloat(point.properties.sum).toLocaleString() : false;
            }

            // Define iconSize from number of locations in cluster.
            let iconSize = layer.markerLog ?
                layer.style.markerMin + layer.style.markerMax / Math.log(c_max) * Math.log(point.properties.count) :
                point.properties.count === 1 ?
                    layer.style.markerMin :
                    layer.style.markerMin + layer.style.markerMax / c_max * point.properties.count;

            if (csize_max) {
            // Define iconSize from number of locations in cluster.
            iconSize = layer.markerLog ?
                layer.style.markerMin + layer.style.markerMax / Math.log(csize_max) * Math.log(point.properties.size) :
                point.properties.size === 1 ?
                    layer.style.markerMin :
                    layer.style.markerMin + layer.style.markerMax / csize_max * point.properties.size;
            }

            // Create marker from icon and iconSize.
            let marker = L.marker(latlng, {
                pane: layer.pane[0],
                zIndexOffset: parseInt(1000 - 1000 / c_max * point.properties.count),
                icon: L.icon({
                    iconUrl: icon,
                    iconSize: iconSize
                }),
                interactive: (layer.infoj) ? true : false
            });

            // Bind tooltip to marker.
            if (tooltip) marker.bindTooltip(tooltip, {
                sticky: true,
                className: 'tooltip',
                direction: 'top',
                offset: [0, -10]
            }).openTooltip();
            
            return marker;
        }
    })
        .on('click', e => clusterMouseClick(e, layer))
        .addTo(global._xyz.map);

    return loadLayer_complete(layer);

}

function clusterMouseClick(e, layer) {

    let count = e.layer.feature.properties.count,
        lnglat = e.layer.feature.geometry.coordinates,
        xhr = new XMLHttpRequest();

    xhr.open('GET', global._xyz.host + '/api/cluster/select?' + utils.paramString({
        locale: _xyz.locale,
        layer: layer.layer,
        table: layer.table,
        filter: JSON.stringify(layer.filter),
        count: count > 99 ? 99 : count,
        lnglat: lnglat,
        token: global._xyz.token
    }));

    xhr.onload = () => {

        if (xhr.status === 401) {
            document.getElementById('timeout_mask').style.display = 'block';
            //console.log(e.target.response);
            return loadLayer_complete(layer);
        }

        if (xhr.status === 200) {
            
            //console.log(e);

            let cluster = JSON.parse(xhr.responseText);

            if (cluster.length === 1) {
                global._xyz.select.selectLayerFromEndpoint({
                    layer: layer.layer,
                    table: layer.table,
                    id: cluster[0].id,
                    marker: cluster[0].lnglat
                });
            }

            if (cluster.length > 1) {

                let table = '<table cellpadding="0" cellspacing="0">';

                for (let i = 0; i < cluster.length; i++) {
                    table += '<tr '
                        + 'data-id="' + cluster[i].id + '" '
                        + 'data-marker="' + cluster[i].lnglat + '">'
                        + '<td>' + cluster[i].label + '</td>'
                        + '</tr>';
                }
                table += '</table>';

                if (cluster.length == 99) table += '<caption><small>Cluster selection is limited to 99 feature.</small></caption>';

                if (global._xyz.view_mode === 'desktop') {

                    // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
                    layer.popup = L.popup()
                        .setLatLng(lnglat.reverse())
                        .setContent('<div class="content scrolly location_table"><div class="scrolly_track"><div class="scrolly_bar"></div></div>' + table + '</div>')
                        .openOn(global._xyz.map);

                    setTimeout(() => utils.scrolly(document.querySelector('.leaflet-popup-content > .scrolly')), 300);
                }

                if (global._xyz.view_mode === 'mobile') {

                    // Remove the line marker which connects the cell with the drop down list;
                    if (layer.layerSelectionLine) global._xyz.map.removeLayer(layer.layerSelectionLine);

                    let dom = {
                        map: document.getElementById('Map'),
                        location_drop: document.querySelector('.location_drop'),
                        location_drop__close: document.querySelector('.location_drop__close'),
                        location_table: document.querySelector('.location_table'),
                        map_button: document.querySelector('.btn_column')
                    };
                    dom.location_table.innerHTML = table;
                    dom.map_button.style['display'] = 'none';
                    dom.location_drop.style['display'] = 'block';

                    // Pan map according to the location of the cluster cell;
                    let map_dom__height = dom.map.clientHeight,
                        map_dom__margin = parseInt(dom.map.style.marginTop),
                        shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(dom.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);

                    // global._xyz.map.setZoomAround(e.latlng, global._xyz.map.getZoom() + 1, { animate: false });
                    global._xyz.map.panBy([0, -shiftY]);

                    // Draw line marker which connects hex cell with drop down.
                    layer.layerSelectionLine = L.marker(lnglat.reverse(), {
                        icon: L.icon({
                            iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
                            iconSize: [3, 1000],
                            iconAnchor: [2, 1000]
                        })
                    }).addTo(global._xyz.map);

                    // Button event to close the .location_drop.
                    dom.location_drop__close.addEventListener('click', function () {
                        if (layer.layerSelectionLine) global._xyz.map.removeLayer(layer.layerSelectionLine);

                        global._xyz.map.panBy([0, parseInt(dom.location_drop.clientHeight) / 2]);

                        dom.location_drop.style['display'] = 'none';
                        dom.map_button.style['display'] = 'block';
                    });
                }

                // Add event to query location info to the location list records.
                let location_table_rows = document.querySelectorAll('.location_table tr');

                for (let i = 0; i < location_table_rows.length; i++) {
                    location_table_rows[i].addEventListener('click', function () {
                        global._xyz.select.selectLayerFromEndpoint({
                            layer: layer.layer,
                            table: layer.table,
                            id: this.dataset.id,
                            marker: this.dataset.marker.split(',')
                        });
                    });
                }
            }

        }
    }

    // Send XHR to middleware.
    xhr.send();
}