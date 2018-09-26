import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

import formats from './formats.mjs';

import * as svg_symbols from './svg_symbols.mjs';

import layers_panel from './layers_panel.mjs';

export default () => {

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

    _xyz.ws.map.createPane('tmp');
    _xyz.ws.map.getPane('tmp').style.zIndex = 549;

    // init is called upon initialisation and when the locale is changed (change_locale === true).
    if (!_xyz.ws.layers) _xyz.ws.layers = {};
    
    // Get the layers from the current locale.
    //let layers = _xyz.ws.locales[_xyz.ws.locale].layers;
    //let groups = _xyz.ws.locales[_xyz.ws.locale].groups || {};
    
    
    _xyz.ws.layers.init = function (change_locale) {

        // Get the layers from the current locale.
        let layers = _xyz.ws.locales[_xyz.ws.locale].layers;
        let groups = _xyz.ws.locales[_xyz.ws.locale].groups || {};

        _xyz.ws.attribution = ['leaflet', 'xyz'];

        // Remove the layers hook on change_locale event.
        if (change_locale) {
            _xyz.ws.removeHook('layers');
            _xyz.ws.map.eachLayer(layer => _xyz.ws.map.removeLayer(layer));
        };

        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.ws.hooks.layers) Object.keys(layers).map(function (layer) {
            layers[layer].display = _xyz.ws.hooks.layers.indexOf(layer) > -1 ? true : false;
        });

        // Remove the layers hook.
        _xyz.ws.removeHook('layers');

        // Empty the layers table.
        dom.layers.innerHTML = '';

        // Add layer groups
        Object.keys(groups).forEach(group => {
            groups[group].container = utils._createElement({
                tag: 'div',
                options: {
                    className: 'drawer drawer-group expandable-group'
                },
                appendTo: dom.layers
            });

            groups[group].header = utils._createElement({
                tag: 'div',
                options: {
                    textContent: groups[group].label,
                    className: 'header-group'
                },
                appendTo: groups[group].container,
                eventListener: {
                    event: "click",
                    funct: e => {
                        utils.toggleExpanderParent({
                            expandable: e.target.parentNode,
                            expandedTag: "expanded-group",
                            expandableTag: "expandable-group",
                            accordeon: true,
                            scrolly: document.querySelector('.mod_container > .scrolly')
                        });
                    }
                }
            });

            groups[group].hideAll = utils._createElement({
                tag: "i",
                options: {
                    className: 'material-icons cursor noselect btn_header hide-group',
                    title: "Hide layers from group",
                    //textContent: (toggleGroupHidden(group) ? "layers" : "layers_clear")
                    textContent: (toggleGroupHidden(group) ? "visibility" : "visibility_off")
                },
                appendTo: groups[group].header,
                style: {
                    display: (toggleGroupHidden(group) ? "block" : "none")
                },
                eventListener: {
                    event: "click",
                    funct: e => {
                        e.stopPropagation();
                        e.target.style.display = "none";
                        
                        Object.values(layers).forEach(layer => {
                            // set URL to acknowledge new token.
                            if (layer.group === group && layer.display) removeLayer(e, layer);   
                        });
                        _xyz.ws.layersCheck();
                    }
                }
            });

            utils._createElement({ // add group expander
                tag: 'i',
                options: {
                    className: 'material-icons cursor noselect btn_header expander-group',
                    title: 'Toggle group panel'
                },
                appendTo: groups[group].header,
                eventListener: {
                    event: 'click',
                    funct: e => {
                        e.stopPropagation();
                        utils.toggleExpanderParent({
                            expandable: groups[group].container,
                            expandedTag: "expanded-group",
                            expandableTag: "expandable-group",
                            scrolly: document.querySelector('.mod_container > .scrolly')
                        });
                    }
                }
            });
        });

        // Loop through the locale layers and build layer control elements.
        Object.keys(layers).forEach(layer => {
            layers[layer].layer = layer;
            layer = layers[layer];
            layer.base = null;
            layer.locale = _xyz.ws.locale;
            layer.name = layer.name || layer.layer;
            if (!layer.style) layer.style = {};
            if (!layer.style.default) layer.style.default = {
                "weight": 1,
                "color": "#333",
                "fill": true,
                "fillColor": "#333",
                "fillOpacity": 0.1
            };
            if (!layer.filter) layer.filter = {};


            // Create layer drawer.
            layer.drawer = utils._createElement({
                tag: 'div',
                options: {
                    className: 'drawer'
                },
                appendTo: (layer.group ? groups[layer.group].container : dom.layers) // add to group if defined
            });

            if (layer.hidden) layer.drawer.style.display = 'none';

            // Create layer header.
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
            _xyz.ws.map.createPane(layer.pane[0]);
            _xyz.ws.map.getPane(layer.pane[0]).style.zIndex = layer.pane[1];

            // Assign getLayer function from format.
            layer.getLayer = formats[layer.format];

            // Create control to toggle layer visibility.
            layer.clear_icon = utils._createElement({
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
                        toggleLayer(e, layer);
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
                                layer.bounds ? _xyz.ws.map.flyToBounds(L.latLngBounds(layer.bounds)) : _xyz.ws.map.panTo(L.latLng(layer.cntr));
                                attributionCheck();
                                _xyz.ws.layersCheck();
                            } else {
                                return false;
                            }
                        }
                    } 
                });
            }

            // Create loader element.
            layer.loader = utils._createElement({
                tag: 'div',
                options: {
                    className: 'loader'
                },
                appendTo: layer.drawer
            });

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
                                _xyz.ws.map.off('click');
                                dom.map.style.cursor = '';
                                return
                            }

                            btn.style.textShadow = '2px 2px 2px #cf9;';
                            dom.map.style.cursor = 'crosshair';

                            _xyz.ws.map.on('click', e => {

                                let marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];

                                utils.removeClass(btn, 'active');
                                _xyz.ws.map.off('click');
                                dom.map.style.cursor = '';

                                // Make select tab active on mobile device.
                                if (_xyz.ws.activateLocationsTab) _xyz.ws.activateLocationsTab();

                                let xhr = new XMLHttpRequest();
                                xhr.open('POST', _xyz.ws.host + '/api/location/new?token=' + _xyz.ws.token);
                                xhr.setRequestHeader('Content-Type', 'application/json');
                                xhr.onload = e => {
                                    if (e.target.status === 401) {
                                        document.getElementById('timeout_mask').style.display = 'block';
                                        console.log(e.target.response);
                                        return
                                    }

                                    if (e.target.status === 200) {
                                        layer.getLayer();
                                        _xyz.ws.select.selectLayerFromEndpoint({
                                            layer: layer.layer,
                                            table: layer.table,
                                            id: e.target.response,
                                            marker: marker,
                                            editable: true
                                        });
                                    }
                                }

                                xhr.send(JSON.stringify({
                                    locale: _xyz.ws.locale,
                                    layer: layer.layer,
                                    table: layer.table,
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
            layers_panel(layer);

            // Push hook for display:true layer (default).
            if (layer.display) {
                _xyz.ws.pushHook('layers', layer.layer);
                _xyz.ws.attribution = _xyz.ws.attribution.concat(layer.attribution || []);
                attributionCheck();
            }

            if (!layer.display) utils.addClass(layer.drawer, 'report-off');

            if(layer.format === 'cluster' && layer.style.marker) {
                utils._createElement({
                    tag: "img",
                    options: {
                        src: svg_symbols.create(layer.style.marker),
                        width: 20,
                        height: 20
                    },
                    style: {
                        float: "right" 
                    },
                    appendTo: layer.header
                });
            }
            // get layer data.
            layer.getLayer();
        });
    };
    
    function toggleGroupHidden(group){ // check if any layer visible
        // Get the layers from the current locale.
        let layers = _xyz.ws.locales[_xyz.ws.locale].layers || {};
        
        return Object.values(layers).some(entry => {
            return (entry.group === group && entry.display) ? true : false;
        });
    }
    
    function toggleLayer(e, layer){
        
        if (e.target.textContent === 'layers_clear') {

            if(layer.group) {
                _xyz.ws.locales[_xyz.ws.locale].groups[layer.group].hideAll.textContent = "visibility";//"layers"; //(toggleGroupHidden(group) ? "block" : "none")
                _xyz.ws.locales[_xyz.ws.locale].groups[layer.group].hideAll.style.display = "block";

            }
            layer.display = true;
            utils.removeClass(layer.drawer, 'report-off');
            e.target.textContent = 'layers';
            _xyz.ws.pushHook('layers', layer.layer);
            _xyz.ws.attribution = _xyz.ws.attribution.concat(layer.attribution || []);
            attributionCheck();
            layer.getLayer();
        } else {
            removeLayer(e, layer);
            _xyz.ws.layersCheck();
        }
    }

    function removeLayer(e, layer){
        layer.loader.style.display = 'none';
        layer.clear_icon.textContent = "layers_clear";
        layer.display = false;
        utils.addClass(layer.drawer, 'report-off');
        _xyz.ws.filterHook('layers', layer.layer);

        if (layer.attribution) layer.attribution.forEach(a => {
            let foo = _xyz.ws.attribution.indexOf(a);
            _xyz.ws.attribution.splice(foo,1);
        });
        attributionCheck();

        if (layer.L) _xyz.ws.map.removeLayer(layer.L);
        if (layer.base) {
            _xyz.ws.map.removeLayer(layer.base);
            layer.base = null;
        }
    }

    _xyz.ws.layers.init();
}

function attributionCheck() {
    // get attribution links and check whether the className is in the attribution list.
    let links = document.querySelectorAll('.attribution > .links > a');
    for (let i = 0; i < links.length; ++i) {
        let me = links[i].className;
        let me_i = _xyz.ws.attribution.indexOf(me);
        if (_xyz.ws.attribution.indexOf(links[i].className) >= 0) {
            links[i].style.display = 'inline-block';
        } else {
            links[i].style.display = 'none';
        }
    }
}