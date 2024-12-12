/**
## /mapview/removeLayer
The module exports the removeLayer method which is bound to the mapview.
@module /mapview/removeLayer

*/
/**
@function removeLayer
@description
A single layer key/object or an array of layer keys/objects can be removed from the mapview with the removeLayer method.
The layer will be hidden from the map if currently displayed.
The layer will be removed from the mapview.layers{} object.
The layer's OpenLayers instance will be disposed properly to prevent memory leaks.
@param {(string|object|array)} layers A single layer key/object or an array of layer keys/objects to be removed from the mapview.
@returns {array} The array of removed layer keys is returned.
*/
export default function removeLayer(layers) {
    // Handle single layer input
    if (!Array.isArray(layers)) {
        layers = [layers];
    }

    const removedLayers = [];

    for (const layer of layers) {
        // Convert layer object to key if needed
        const layerKey = typeof layer === 'string' ? layer : layer.key;

        if (!layerKey || !this.layers[layerKey]) {
            console.warn(`Layer ${layerKey} not found in mapview`);
            continue;
        }

        const targetLayer = this.layers[layerKey];

        // Hide the layer if it's currently displayed
        if (targetLayer.display) {
            targetLayer.hide();
        }

        // Clean up OpenLayers layer instance if it exists
        if (targetLayer.L) {
            targetLayer.L.dispose();
        }

        // Remove layer from mapview.layers
        delete this.layers[layerKey];
        removedLayers.push(layerKey);
    }

    // Will resolve once the map has completed render
    this.renderComplete = new Promise(resolve => {
        this.Map.once('rendercomplete', resolve);
    });

    return removedLayers;
}