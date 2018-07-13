const utils = require('./utils');
const formats = {
    cluster: require('./layer_cluster'),
    mvt: require('./layer_mvt'),
    geojson: require('./layer_geojson'),
    grid: require('./layer_grid'),
    tiles: require('./layer_tiles')
};
const layers_panel = require('./layers_panel');

module.exports = () => {

    // Assign dom objects.
    let dom = {
        map: document.getElementById('Map'),
        layers: utils._createElement({
            tag: 'div',
            options: {
                className: 'content'
            },
            appendTo: document.getElementById('Layers')
        })
    };

    _xyz.map.createPane('tmp');
    _xyz.map.getPane('tmp').style.zIndex = 549;

    // init is called upon initialisation and when the locale is changed (change_locale === true).
    if (!_xyz.layers) _xyz.layers = {};
    _xyz.layers.init = function (change_locale) {

        _xyz.attribution = ['leaflet', 'xyz'];

        // Remove the layers hook on change_locale event.
        if (change_locale) {
            _xyz.removeHook('layers');
            _xyz.map.eachLayer(layer => _xyz.map.removeLayer(layer))
        };

        // Get the layers from the current locale.
        let layers = _xyz.locales[_xyz.locale].layers;

        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.hooks.layers) Object.keys(layers).map(function (layer) {
            layers[layer].display = _xyz.hooks.layers.indexOf(layer) > -1 ? true : false;
        });

        // Remove the layers hook.
        _xyz.removeHook('layers');

        // Empty the layers table.
        dom.layers.innerHTML = '';

        // Loop through the locale layers and build layer control elements.
        Object.keys(layers).map(layer => {
            layers[layer].layer = layer;
            layer = layers[layer];
            layer.base = null;
            layer.locale = _xyz.locale;
            layer.name = layer.name || layer.layer;
            if (!layer.style) layer.style = {};
            if (!layer.style.default) layer.style.default = { "weight": 1, "color": "#000" };
            if (!layer.filter) layer.filter = {};

            layer.drawer = utils._createElement({
                tag: 'div',
                options: {
                    className: 'drawer'
                },
                appendTo: dom.layers
            });

            if (layer.hidden) layer.drawer.style.display = 'none';

            layer.header = utils._createElement({
                tag: 'div',
                options: {
                    textContent: layer.name,
                    className: 'header'
                },
                style: {
                    borderBottom: '2px solid ' + (((layer.style || {}).default || {}).color ? layer.style.default.color : '#333')
                },
                appendTo: layer.drawer
            });

            // Create the pane and set layers function.
            layer.pane = layer.pane || ['default', 501];
            _xyz.map.createPane(layer.pane[0]);
            _xyz.map.getPane(layer.pane[0]).style.zIndex = layer.pane[1];

            layer.getLayer = formats[layer.format].getLayer;

            // Create control to toggle layer visibility.
            utils._createElement({
                tag: 'i',
                options: {
                    textContent: layer.display ? 'layers' : 'layers_clear',
                    className: 'material-icons cursor noselect btn_header',
                    title: 'Toggle visibility'
                },
                appendTo: layer.header,
                eventListener: {
                    event: 'click',
                    funct: e => {
                        e.stopPropagation();
                        if (e.target.textContent === 'layers_clear') {
                            layer.display = true;
                            utils.removeClass(layer.drawer, 'report-off');
                            e.target.textContent = 'layers';
                            _xyz.pushHook('layers', layer.layer);
                            _xyz.attribution = _xyz.attribution.concat(layer.attribution || []);
                            attributionCheck();
                            layer.getLayer();
                        } else {
                            layer.loader.style.display = 'none';
                            layer.display = false;
                            utils.addClass(layer.drawer, 'report-off');
                            e.target.textContent = 'layers_clear';
                            _xyz.filterHook('layers', layer.layer);

                            if (layer.attribution) layer.attribution.forEach(a => {
                                let foo = _xyz.attribution.indexOf(a);
                                _xyz.attribution.splice(foo,1);
                            });
                            attributionCheck();

                            if (layer.L) _xyz.map.removeLayer(layer.L);
                            if (layer.base) {
                                _xyz.map.removeLayer(layer.base);
                                layer.base = null;
                            }
                            _xyz.layersCheck();
                        }
                    }
                }
            });
            
            // Create zoom to layer control
            if(layer.cntr || layer.bounds){
                utils._createElement({
                    tag: 'i',
                    options: {
                        textContent: "search",
                        className: 'material-icons cursor noselect btn_header',
                        title: 'Pan to layer'
                    },
                    appendTo: layer.header,
                    eventListener: {
                        event: 'click',
                        funct: e => {
                            e.stopPropagation();
                            if(layer.display){
                                layer.bounds ? _xyz.map.flyToBounds(L.latLngBounds(layer.bounds)) : _xyz.map.panTo(L.latLng(layer.cntr));
                                attributionCheck();
                                _xyz.layersCheck();
                            } else {
                                return false;
                            }
                        }
                    } 
                });
            }

            // Create loader element.
            layer.loader = utils.createElement('div', {
                className: 'loader'
            });
            layer.drawer.appendChild(layer.loader);

            // Add edit control to layer header.
            if (layer.editable && layer.editable === 'geometry') {

                utils._createElement({
                    tag: 'i',
                    options: {
                        textContent: 'add_location',
                        className: 'material-icons cursor noselect btn_header',
                        title: 'Create new location'
                    },
                    appendTo: layer.header,
                    eventListener: {
                        event: 'click',
                        funct: e => {
                            e.stopPropagation();
                            let btn = e.target;
                            utils.toggleClass(btn, 'active');

                            if (!utils.hasClass(btn, 'active')) {
                                _xyz.map.off('click');
                                dom.map.style.cursor = '';
                                return
                            }

                            btn.style.textShadow = '2px 2px 2px #cf9;';
                            dom.map.style.cursor = 'crosshair';

                            _xyz.map.on('click', e => {

                                let marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];

                                utils.removeClass(btn, 'active');
                                _xyz.map.off('click');
                                dom.map.style.cursor = '';

                                // Make select tab active on mobile device.
                                if (_xyz.activateLocationsTab) _xyz.activateLocationsTab();

                                let xhr = new XMLHttpRequest();
                                xhr.open('POST', host + 'api/location/new');
                                xhr.setRequestHeader('Content-Type', 'application/json');
                                xhr.onload = e => {
                                    if (e.target.status === 401) {
                                        document.getElementById('timeout_mask').style.display = 'block';
                                        console.log(e.target.response);
                                        return;
                                    }

                                    if (e.target.status === 200) {
                                        layer.getLayer();
                                        _xyz.select.selectLayerFromEndpoint({
                                            layer: layer.layer,
                                            table: layer.table,
                                            id: e.target.response,
                                            marker: marker,
                                            editable: true
                                        });
                                    }
                                }
                                
                                xhr.send(JSON.stringify({
                                    dbs: layer.dbs,
                                    table: layer.table,
                                    qID: layer.qID,
                                    geom: layer.geom,
                                    log_table: layer.log_table,
                                    geometry: {
                                        type: 'Point',
                                        coordinates: marker
                                    }
                                }));
                            });
                        }
                    }
                });
            }

            //Add panel to layer control.
            layer.panel = layers_panel.panel(layer);

            // Add panel control when panel contains children.
            if (layer.panel.children.length > 0) {
                
                utils.addClass(layer.header, 'pane_shadow');
                utils.addClass(layer.drawer, 'expandable');

                layer.header.addEventListener('click', e => {
                    utils.toggleExpanderParent({
                        expandable: layer.drawer,
                        accordeon: true,
                        scrolly: document.querySelector('.mod_container > .scrolly')
                    });
                });

                layer.drawer.appendChild(layer.panel);  

                // Add icon which allows to expand / collaps panel.
                utils._createElement({
                    tag: 'i',
                    options: {
                        className: 'material-icons cursor noselect btn_header expander',
                        title: 'Toggle layer panel'
                    },
                    appendTo: layer.header,
                    eventListener: {
                        event: 'click',
                        funct: e => {
                            e.stopPropagation();
                            utils.toggleExpanderParent({
                                expandable: layer.drawer,
                                scrolly: document.querySelector('.mod_container > .scrolly')
                            });
                        }
                    }
                });
            }

            // Push hook for display:true layer (default).
            if (layer.display) {
                _xyz.pushHook('layers', layer.layer);
                _xyz.attribution = _xyz.attribution.concat(layer.attribution || []);
                attributionCheck();
            }

            if (!layer.display) utils.addClass(layer.drawer, 'report-off');

            layer.getLayer();
        });
    };
    _xyz.layers.init();

    function attributionCheck() {
        // get attribution links and check whether the className is in the attribution list.
        let links = document.querySelectorAll('.attribution > .links > a');
        for (let i = 0; i < links.length; ++i) {
            let me = links[i].className;
            let me_i = _xyz.attribution.indexOf(me);
            if (_xyz.attribution.indexOf(links[i].className) >= 0) {
                links[i].style.display = 'inline-block';
            } else {
                links[i].style.display = 'none';
            }
        }
    }
}