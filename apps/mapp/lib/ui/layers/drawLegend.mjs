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

The legend method is resolved from the current layer.style.theme at execution time. The drawLegend reference is therefore stable across theme changes and is registered once as a layer.showCallbacks method in the [layerStyle panel]{@link module:/ui/elements/layerStyle~panel} method.

The method will shortcircuit if the layer has no style.legend node to render into, or if no legend method is available for the current theme type.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {HTMLElement} [style.legend] The node into which the legend content is rendered.
@property {Object} [style.theme] The current theme.
@property {string} [theme.type] Key for the legend method in the mapp.ui.layers.legends{} library object.
*/
export default function drawLegend(layer) {
  // The legend methods replace the children of the style.legend node.
  if (!layer.style?.legend) return;

  mapp.ui.layers.legends[layer.style.theme?.type]?.(layer);
}
