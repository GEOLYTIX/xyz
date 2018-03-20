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

    // locale.layers is called upon initialisation and when the country is changed (change_country === true).
    if (!_xyz.layers) _xyz.layers = {};
    _xyz.layers.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) {
            _xyz.removeHook('layers');
            _xyz.map.eachLayer(function(l){
                _xyz.map.removeLayer(l);
            })
        };

        // Get the layers from the current country.
        let layers = _xyz.countries[_xyz.country].layers;
        
        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.hooks.layers) Object.keys(layers).map(function(layer){
            layers[layer].display = _xyz.hooks.layers.indexOf(layer) > -1 ? true : false;
        });

        // Remove the layers hook.
        _xyz.removeHook('layers');

        // Empty the layers table.
        dom.layers.innerHTML = '';

        // Loop through the country layers and build layer control elements.
        Object.keys(layers).map(function(layer){
            layers[layer].layer = layer;
            layer = layers[layer];
            layer.base = null;
            //layer.name = typeof layer.name == 'undefined' ? layer.layer : layer.name;
            layer.name = layer.name || layer.layer;

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
            let header = utils.createElement('div', {
                textContent: layer.name,
                className: 'header'
            });
            header.style.borderBottom = '2px solid ' + (layer.style ? layer.style.color : '#333');

            // Create the pane and set layers function.
            layer.pane = layer.pane || ['default', 501];
            _xyz.map.createPane(layer.pane[0]);
            _xyz.map.getPane(layer.pane[0]).style.zIndex = layer.pane[1];

            layer.getLayer = formats[layer.format].getLayer;

            // Create control to toggle layer visibility.
            let i = utils.createElement('i', {
                textContent: layer.display ? 'visibility' : 'visibility_off',
                className: 'material-icons cursor noselect btn',
                title: 'Toggle visibility'
            });
            i.addEventListener('click', function () {
                if (this.textContent === 'visibility_off') {
                    layer.display = true;
                    this.textContent = 'visibility';
                    _xyz.pushHook('layers', layer.layer);
                    layer.getLayer();
                } else {
                    layer.loader.style.display = 'none';
                    layer.display = false;
                    this.textContent = 'visibility_off';
                    _xyz.filterHook('layers', layer.layer);
                    if (layer.L) _xyz.map.removeLayer(layer.L);
                    if (layer.base) {
                        _xyz.map.removeLayer(layer.base);
                        layer.base = null;
                    }
                    _xyz.layersCheck();
                }
            });
            header.appendChild(i);
            layer.drawer.appendChild(header);


            // Create loader element.
            layer.loader = utils.createElement('div', {
                className: 'loader'
            });
            layer.drawer.appendChild(layer.loader);
   
      
            // Add panel to layer control.
            if (layer.panel) {
                header.style.boxShadow = '0 3px 3px -3px black';
                layer.panel = utils.createElement('div', {
                    className: 'panel'
                });
                layer.drawer.style.maxHeight = '35px';
                layer.drawer.appendChild(layer.panel);

                layers_panel[layer.format](layer);

                let i = utils.createElement('i', {
                    textContent: 'expand_more',
                    className: 'material-icons cursor noselect btn',
                    title: 'Collapse layer panel'
                });

                layer.panelToggle = function () {
                    if (i.textContent === 'expand_less') {
                        layer.drawer.style.maxHeight = '35px';
                        header.style.boxShadow = '0 3px 3px -3px black';
                        i.textContent = 'expand_more';
                        i.title = "Collapse layer panel";
                    } else {
                        layer.drawer.style.maxHeight = (layer.panel.clientHeight + 40) + 'px';
                        header.style.boxShadow = '';
                        i.textContent = 'expand_less';
                        i.title = "Expand layer panel";
                    }
                };
              
                i.addEventListener('click',layer.panelToggle);
                header.appendChild(i);
            }

            // Add panel to layer control.
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
                header.appendChild(i);
            }

            // Push hook for display:true layer (default).
            if (layer.display) {
                _xyz.pushHook('layers', layer.layer);
                // layer.panelToggle();
            }
            layer.getLayer();
        });
        
    };
    _xyz.layers.init();
}