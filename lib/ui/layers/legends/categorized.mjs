/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

Dictionary entries:
- layer_style_switch_caption
- layer_style_switch_all
- layer_style_cluster

@requires /dictionary 

@requires /ui/elements/legendIcon
@requires /ui/elements/themeLegendSwitch

@module /ui/layers/legends/categorized
*/

/**
@function categorizedTheme

@description
The categorizedTheme method creates and returns a categorized theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/
export default function categorizedTheme(layer) {
  mapp.ui.layers.legends.legendHelper.themeParser(layer);

  const theme = layer.style.theme;

  theme.categories.forEach((cat) => {
    mapp.ui.layers.legends.legendHelper.createLegend(cat, theme, layer);
  });

  if (layer.style.cluster) {
    mapp.ui.layers.legends.legendHelper.clusterLegend(layer);
  }

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${theme.legend.switch || ''}
      <div class=${theme.legend.classList} style=${theme.legend.style}>
        ${theme.legend.grid}`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  //Determine whether to show the legend based on layer.display
  if (theme.distribution === 'count') {
    mapp.ui.layers.legends.legendHelper.distributedLegend(layer);
  }

  //Display legend for other cases.
  layer.style.legend.style.removeProperty('display');

  return theme.legend.node;
}
