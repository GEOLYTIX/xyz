const L = require('leaflet');
const utils = require('./utils');
const formats = {
    cluster: require('./layer_cluster'), // import cluster layer
    mvt: require('./layer_mvt'), // import mvt layer
    geojson: require('./layer_geojson') // import geojson layer
};

module.exports = function(_){
    
    // Assign dom objects.
    let dom = {
        layersTable: document.querySelector('#layers_module .layersTable')
    };

    // locale.layers is called upon initialisation and when the country is changed (change_country === true).
    _.layers.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) _.removeHook('layers');

        // Get the layers from the current country.
        let layers = _.countries[_.country].layers;
        
        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_.hooks.layers) Object.keys(layers).map(function(layer){
            layers[layer].display = _.hooks.layers.indexOf(layer) > -1 ? true : false;
        });

        // Remove the layers hook.
        _.removeHook('layers');

        // Empty the layers table.
        dom.layersTable.innerHTML = '';

        // Loop through the country layers and build layer control elements.
        Object.keys(layers).map(function(layer){
                                     
            // Create the layer control row with checkbox and label; input/label id is the layer key.
            let tr = document.createElement('tr');
            let td = utils.createElement('td', {
                className: 'box'
            });
            let input = utils.createElement('input', {
                type: 'checkbox',
                id: layer
            });
            
            // Call the toggleLayer function for layers with display=true.
            if (layers[layer].display) {
                input.checked = true;
                _.pushHook('layers', layer);
                layers[layer].getLayer = formats[layers[layer].format].getLayer;
                layers[layer].getLayer(_);
            }

            // Add the change event listener to the layer control input.
            input.addEventListener('change', function () {
                layers[layer].display = input.checked;
                if (layers[layer].display) {
                    _.pushHook('layers', layer);
                    layers[layer].getLayer = formats[layers[layer].format].getLayer;
                    layers[layer].getLayer(_);
                } else {
                    _.filterHook('layers', layer);
                    if(layers[layer].l) _.map.removeLayer(layers[layer].l);
                }
            });

            // Append the layer control to the table row.
            td.appendChild(input);
            td.appendChild(utils.createElement('label', {
                htmlFor: layer
            }));
            tr.appendChild(td);
            tr.appendChild(utils.createElement('td', {
                textContent: layers[layer].name
            }));
            dom.layersTable.appendChild(tr);

            // Append legend row underneath layer control row.
            tr = document.createElement('tr');
            tr.appendChild(document.createElement('td'));
            tr.appendChild(utils.createElement('td', {
                className: 'legend'
            }));
            dom.layersTable.appendChild(tr);
        });
        
    };
    _.layers.init();

}