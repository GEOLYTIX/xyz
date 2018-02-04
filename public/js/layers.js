const utils = require('./utils');
const formats = {
    cluster: require('./layer_cluster'), // import cluster layer
    mvt: require('./layer_mvt'), // import mvt layer
    geojson: require('./layer_geojson') // import geojson layer
};

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

            // Set layer id to layer.
            layers[layer].layer = layer;

            // Empty layer legend.
            layers[layer].legend = null;

            // Query layer style
            setLayerStyle(layers[layer]);
                                     
            // Create container element to contain the header with controls and the info table.
            layers[layer].drawer = document.createElement('div');
            layers[layer].drawer.className = 'drawer';

            // Create the header element to contain the control elements
            let header = utils.createElement('div', {
                textContent: layers[layer].name,
                className: 'header'
            });
            header.style.borderBottom = '2px solid ' + layers[layer].style.color;

            // Create the pane and set layers function.
            _xyz.map.createPane(layers[layer].pane[0]);
            _xyz.map.getPane(layers[layer].pane[0]).style.zIndex = layers[layer].pane[1];
            layers[layer].getLayer = formats[layers[layer].format].getLayer;

            // Create the clear control element to control the removal of a feature from the select.layers.
            let i = utils.createElement('i', {
                textContent: 'visibility',
                className: 'material-icons cursor noselect btn',
                title: 'Toggle visibility'
            });
            i.addEventListener('click', function () {
                let container = this.parentNode.parentNode;
                let header = this.parentNode;
                if (this.textContent === 'visibility') {
                    layers[layer].display = true;
                    this.textContent = 'visibility_off';
                    _xyz.pushHook('layers', layer);
                    layers[layer].getLayer();
                } else {
                    layers[layer].display = false;
                    _xyz.filterHook('layers', layer);
                    if (layers[layer].L) _xyz.map.removeLayer(layers[layer].L);
                    this.textContent = 'visibility';
                }
            });
            header.appendChild(i);

            // Display layers with display=true (default).
            if (layers[layer].display) {
                i.textContent = 'visibility_off';
                _xyz.pushHook('layers', layer);
            }
            layers[layer].getLayer();

            // Add header element to the container.
            layers[layer].drawer.appendChild(header);

            dom.layers.appendChild(layers[layer].drawer);
        });
        
    };
    _xyz.layers.init();

    function setLayerStyle(layer){

        // Set layer styles to default if not present
        if (!layer.style) layer.style = _xyz.layers.style;
        if (!layer.styleHighlight) layer.styleHighlight = _xyz.layers.styleHighlight;
    }
}