import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

export default function() {

    // Assign the table based on the zoom array.
    let layer = this,
        zoom = _xyz.ws.map.getZoom(),
        zoomKeys = Object.keys(layer.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

    layer.table = zoom > maxZoomKey ?
        layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];

    // Make drawer opaque if no table present.
    layer.drawer.style.opacity = !layer.table ? 0.4 : 1;

    if (layer.table && layer.display && layer.locale === _xyz.ws.locale) {

        // Create new vector.xhr
        layer.loaded = false;
        layer.loader.style.display = 'block';

        let url = _xyz.ws.host + '/api/mvt/get/{z}/{x}/{y}?' + utils.paramString({
            locale: _xyz.ws.locale,
            layer: layer.layer,
            table: layer.table,
            properties: layer.properties,
            token: _xyz.ws.token
        }),
            options = {
                rendererFactory: L.svg.tile,
                interactive: (layer.infoj && layer.qID) || false,
                pane: layer.pane[0],
                getFeatureId: (f) => f.properties.id,
                vectorTileLayerStyles: {}
            };

        // set style for each layer
        options.vectorTileLayerStyles[layer.layer] = applyLayerStyle;

        function applyLayerStyle(properties, zoom) {

            if (layer.style && layer.style.theme && layer.style.theme.type === 'categorized' && layer.style.theme.cat[properties[layer.style.theme.field]]) {

                return layer.style.theme.cat[properties[layer.style.theme.field]].style;

            }

            if (layer.style && layer.style.theme && layer.style.theme.type === 'graduated') {

                let style = layer.style.theme.cat[0].style;

                for (let i = 0; i < layer.style.theme.cat.length; i++) {
                    if (properties[layer.style.theme.field] < layer.style.theme.cat[i].val) break;
                    style = layer.style.theme.cat[i].style;
                }

                return style;

            }

            return layer.style.default;
        }


        if (layer.L) _xyz.ws.map.removeLayer(layer.L);

        layer.L = L.vectorGrid.protobuf(url, options)
            .on('error', err => console.error(err))
            .on('load', e => {
                //e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
                layer.loaded = true;
                layer.loader.style.display = 'none';
                _xyz.ws.layersCheck();
            })
            .on('click', e => {
                if (e.layer.properties.selected) return;

                e.layer.properties.selected = true;

                function checkCurrentSelection(e) {
                    let check = false;
                    if (_xyz.ws.hooks.select) {
                        _xyz.ws.hooks.select.map(item => {
                            item = item.split('!');
                            if (item[1] === layer.layer && item[2] === layer.table && item[3] === String(e.layer.properties.id)) {
                                check = true;
                            }
                        });
                    }
                    return check;
                }

                if (!checkCurrentSelection(e)) {
                    // set cursor to wait
                    let els = _xyz.ws.map.getContainer().querySelectorAll('.leaflet-interactive');

                    for (let el of els) {
                        el.classList += ' wait-cursor-enabled';
                    }
                    // get selection
                    _xyz.ws.select.selectLayerFromEndpoint({
                        layer: layer.layer,
                        table: layer.table,
                        id: e.layer.properties.id,
                        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                    });
                    e.layer.properties.selected = false;
                } else {
                    //console.log('feature ' + e.layer.properties.id + ' already selected');
                }


            })
            .on('mouseover', e => {
                e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight || { 'color': '#090' });
            })
            .on('mouseout', e => {
                e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
            })
            .addTo(_xyz.ws.map);
    }
}