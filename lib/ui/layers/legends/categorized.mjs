/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

@requires /ui/layers/legends/utils

@module /ui/layers/legends/categorized
*/

import {
  catElement,
  clusterLegend,
  themeLegend,
  themeLegendSwitch,
} from './utils.mjs';

/**
@function categorizedTheme

@description
The categorizedTheme method creates and returns a categorized theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/
export default function categorizedTheme(layer) {
  const theme = layer.style.theme;

  themeLegend(theme);

  theme.legend.grid = theme.categories.map((cat) => {
    return catElement(cat, theme, layer);
  });

  if (layer.style.cluster) {
    theme.legend.grid.push(clusterLegend(layer));
  }

  const switchAll = themeLegendSwitch();

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${switchAll}
      <div class=${theme.legend.classList}>
        ${theme.legend.grid}`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  return theme.legend.node;
}
