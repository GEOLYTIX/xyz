/**
## /layer/drawLegend

The module exports the default drawLegend method for the mapp.layer{} object.

The mapp library doesn't render legends without the MAPP.UI library. The ui module replaces mapp.layer.drawLegend with the [ui drawLegend]{@link module:/ui/layers/drawLegend} method when loaded.

@module /layer/drawLegend
*/

/**
@function drawLegend

@description
The drawLegend method is called by the [featureFields.process]{@link module:/layer/featureFields~process} method once the distribution of a theme has been processed from the layer data.

The method must be called as mapp.layer.drawLegend() for the replacement by the ui library to take effect.

The method doesn't render a legend if the ui library is not loaded.

@param {layer} layer A decorated mapp layer. The layer argument is passed to the method which replaces mapp.layer.drawLegend.
*/
export default function drawLegend() {
  // The mapp library has no legend method. The ui library replaces mapp.layer.drawLegend to render the legend for the layer.
}
