const utils = require('./utils');
const formats = {
    cluster: require('./layer_cluster'),
    mvt: require('./layer_mvt'),
    geojson: require('./layer_geojson'),
    grid: require('./layer_grid'),
    tiles: require('./layer_tiles')
};
const layers_panel = require('./layers_panel');

module.exports = function(){
    
    // Assign dom objects.
    let dom = {
        map: document.getElementById('map'),
        layers: document.querySelector('#layers_module .layers')
    };

    // init is called upon initialisation and when the locale is changed (change_locale === true).
    if (!_xyz.layers) _xyz.layers = {};
    _xyz.layers.init = function (change_locale) {

        // Remove the layers hook on change_locale event.
        if (change_locale) {
            _xyz.removeHook('layers');
            _xyz.map.eachLayer(function(l){
                _xyz.map.removeLayer(l);
            })
        };

        // Get the layers from the current locale.
        let layers = _xyz.locales[_xyz.locale].layers;
        
        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.hooks.layers) Object.keys(layers).map(function(layer){
            layers[layer].display = _xyz.hooks.layers.indexOf(layer) > -1 ? true : false;
        });

        // Remove the layers hook.
        _xyz.removeHook('layers');

        // Empty the layers table.
        dom.layers.innerHTML = '';

        // Loop through the locale layers and build layer control elements.
        Object.keys(layers).map(function(layer){
            layers[layer].layer = layer;
            layer = layers[layer];
            layer.base = null;
            layer.locale = _xyz.locale;
            layer.name = layer.name || layer.layer;
            if (!layer.style) layer.style = {};
            if (!layer.style.default) layer.style.default = {"weight": 1, "color": "#000"};

            // Set layer styles
            Object.keys(_xyz.layers).map(function(key){
                if(!layer[key]) layer[key] = _xyz.layers[key];
            });
                                     
            // Create container element to contain the header with controls and the info table.
            layer.drawer = utils.createElement('div', {
                className: 'drawer'
            });
            dom.layers.appendChild(layer.drawer);

            // Create the header element to contain the control elements
            layer.header = utils.createElement('div', {
                textContent: layer.name,
                className: 'header'
            });
            layer.header.style.borderBottom = '2px solid ' + (layer.style && layer.style.default && layer.style.default.color ? layer.style.default.color : '#333');

            // Create the pane and set layers function.
            layer.pane = layer.pane || ['default', 501];
            _xyz.map.createPane(layer.pane[0]);
            _xyz.map.getPane(layer.pane[0]).style.zIndex = layer.pane[1];

            layer.getLayer = formats[layer.format].getLayer;

            // Create control to toggle layer visibility.
            let i = utils.createElement('i', {
                textContent: layer.display ? 'layers' : 'layers_clear',
                className: 'material-icons cursor noselect btn',
                title: 'Toggle visibility'
            });
            i.addEventListener('click', function () {
                if (this.textContent === 'layers_clear') {
                    layer.display = true;
                    this.textContent = 'layers';
                    _xyz.pushHook('layers', layer.layer);
                    layer.getLayer();
                } else {
                    layer.loader.style.display = 'none';
                    layer.display = false;
                    this.textContent = 'layers_clear';
                    _xyz.filterHook('layers', layer.layer);
                    if (layer.L) _xyz.map.removeLayer(layer.L);
                    if (layer.base) {
                        _xyz.map.removeLayer(layer.base);
                        layer.base = null;
                    }
                    _xyz.layersCheck();
                }
            });
            layer.header.appendChild(i);
            layer.drawer.appendChild(layer.header);


            // Create loader element.
            layer.loader = utils.createElement('div', {
                className: 'loader'
            });
            layer.drawer.appendChild(layer.loader);
   
            //Add panel to layer control.
            layer.panel = layers_panel.panel(layer);

            // Add panel control when panel contains children.
            if (layer.panel.children.length > 0) {

                // Set the box shadow which indicates collapsed content.
                layer.header.style.boxShadow = '0 3px 3px -3px black';
                layer.drawer.style.maxHeight = '35px';
                layer.drawer.appendChild(layer.panel);

                // Add icon which allows to expand / collaps panel.
                i = utils.createElement('i', {
                    textContent: 'expand_more',
                    className: 'material-icons cursor noselect btn',
                    title: 'Collapse layer panel'
                });
                i.addEventListener('click', () => {
                    if (i.textContent === 'expand_less') {
                        layer.drawer.style.maxHeight = '35px';
                        layer.header.style.boxShadow = '0 3px 3px -3px black';
                        i.textContent = 'expand_more';
                        i.title = "Collapse layer panel";
                    } else {
                        layer.drawer.style.maxHeight = (layer.panel.clientHeight + 40) + 'px';
                        layer.header.style.boxShadow = '';
                        i.textContent = 'expand_less';
                        i.title = "Expand layer panel";
                    }
                });
                layer.header.appendChild(i);
            }

            // Add edit control to layer header.
            if (layer.editable && layer.editable === 'geometry') {
                let i = utils.createElement('i', {
                    textContent: 'add_location',
                    className: 'material-icons cursor noselect btn',
                    title: 'Create new location'
                });

                i.addEventListener('click', function(){
                    utils.toggleClass(i, 'active');

                    if (!utils.hasClass(i, 'active')){
                        _xyz.map.off('click');
                        dom.map.style.cursor = '';
                        return
                    }

                    this.style.textShadow = '2px 2px 2px #cf9;';
                    dom.map.style.cursor = 'crosshair';
                    _xyz.map.on('click', function(e){
                        utils.removeClass(i, 'active');
                        _xyz.map.off('click');
                        dom.map.style.cursor = '';

                        // Make select tab active on mobile device.
                        if (_xyz.activateSelectTab) _xyz.activateSelectTab();

                        let xhr = new XMLHttpRequest();
                        xhr.open('POST', 'q_save');
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.onload = function () {
                            if (this.status === 200) {
                                layer.getLayer();               
                                _xyz.select.selectLayerFromEndpoint({
                                    layer: layer.layer,
                                    table: layer.table,
                                    id: this.response,
                                    marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)],
                                    editable: true
                                });
                            }
                        }
                        xhr.send(JSON.stringify({
                            dbs: layer.dbs,
                            table: layer.table,
                            qID: layer.qID,
                            geometry: {
                                type: 'Point',
                                coordinates: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                            }
                        }));            
                    });
                });
                layer.header.appendChild(i);
            }

            // Push hook for display:true layer (default).
            if (layer.display) _xyz.pushHook('layers', layer.layer);

            layer.getLayer();
        });
        
    };
    _xyz.layers.init();
}