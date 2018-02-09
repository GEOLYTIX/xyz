const utils = require('./utils');
const formats = {
    cluster: require('./layer_cluster'),
    mvt: require('./layer_mvt'),
    geojson: require('./layer_geojson'),
    grid: require('./layer_grid')
};
const layers_panel = require('./layers_panel');

module.exports = function(){
    
    // Assign dom objects.
    let dom = {
        layers: document.querySelector('#layers_module .layers')
    };

    // locale.layers is called upon initialisation and when the country is changed (change_country === true).
    _xyz.layers.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) _xyz.removeHook('layers');

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

            // Query layer style !!! Needs adjusting for different layer types.
            if (!layer.style) layer.style = _xyz.layers.style;
            if (!layer.styleHighlight) layer.styleHighlight = _xyz.layers.styleHighlight;
                                     
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
            header.style.borderBottom = '2px solid ' + layer.style.color;

            // Create the pane and set layers function.
            _xyz.map.createPane(layer.pane[0]);
            _xyz.map.getPane(layer.pane[0]).style.zIndex = layer.pane[1];
            layer.getLayer = formats[layer.format].getLayer;


            // Create control to toggle layer visibility.
            let i = utils.createElement('i', {
                textContent: layer.display ? 'visibility_off' : 'visibility',
                className: 'material-icons cursor noselect btn',
                title: 'Toggle visibility'
            });
            i.addEventListener('click', function () {
                if (this.textContent === 'visibility') {
                    layer.display = true;
                    this.textContent = 'visibility_off';
                    _xyz.pushHook('layers', layer.layer);
                    layer.getLayer();
                } else {
                    layer.display = false;
                    this.textContent = 'visibility';
                    _xyz.filterHook('layers', layer.layer);
                    if (layer.L) _xyz.map.removeLayer(layer.L);
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
                layer.panel = utils.createElement('div', {
                    className: 'panel'
                });
                layer.drawer.style.maxHeight = '30px';
                layer.drawer.appendChild(layer.panel);

                layers_panel[layer.format](layer);

                let i = utils.createElement('i', {
                    textContent: 'expand_more',
                    className: 'material-icons cursor noselect btn',
                    title: 'Collapse layer panel'
                });

                layer.panelToggle = function () {
                    if (i.textContent === 'expand_less') {
                        layer.drawer.style.maxHeight = '30px';
                        header.style.boxShadow = '0 3px 3px -3px black';
                        i.textContent = 'expand_more';
                        i.title = "Collapse layer panel";
                    } else {
                        layer.drawer.style.maxHeight = (layer.panel.clientHeight + 35) + 'px';
                        header.style.boxShadow = '';
                        i.textContent = 'expand_less';
                        i.title = "Expand layer panel";
                    }
                };
              
                i.addEventListener('click',layer.panelToggle);
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