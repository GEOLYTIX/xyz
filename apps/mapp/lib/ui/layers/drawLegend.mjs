/**
### /ui/layers/drawLegend

The module exports the drawLegend method which renders the legend for the current layer style theme.

@requires /ui/layers/legends

@module /ui/layers/drawLegend
*/

/**
@function drawLegend

@description
The drawLegend method renders the legend for the current theme into the layer.style.legend node.

The legend method is resolved from the current layer.style.theme at execution time. The drawLegend reference is therefore stable across theme changes and is registered once as a layer.showCallbacks method in the [view]{@link module:/ui/layers/view~view} method.

The method will shortcircuit if no legend method is available for the current theme type.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} [style.theme] The current theme.
@property {string} [theme.type] Key for the legend method in the mapp.ui.layers.legends{} library object.
*/
export default function drawLegend(layer) {
  mapp.ui.layers.legends[layer.style?.theme?.type]?.(layer);
}
