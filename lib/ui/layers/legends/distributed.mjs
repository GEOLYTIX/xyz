/**
### /ui/layers/legends/distributed

The distributed theme legend module exports the distributedTheme to the `ui.layers.legend{}` library object.

@requires /ui/layers/legends/utils

@module /ui/layers/legends/distributed
*/

import {
  clusterLegend,
  createLegend,
  distributedLegend,
  themeParser,
} from './utils.mjs';
/**
@function distributedTheme

@description
The distributedTheme method creates and returns a distributed theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The distributed theme legend element.
*/
export default function distributedTheme(layer) {
  themeParser(layer);

  const theme = layer.style.theme;

  // If the legend is set to be hidden, exit the function.
  if (theme.hideLegend) return;

  // For each category in the theme.categories array
  for (const cat of theme.categories) {
    cat.label = cat.values?.join(', ');

    createLegend(cat, theme, layer);
  }

  if (layer.style.cluster) {
    clusterLegend(layer);
  }

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${theme.legend.switch || ''}
      <div class=${theme.legend.classList} style=${theme.legend.style}>
        ${theme.legend.grid}`;

  distributedLegend(layer);

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  layer.L.once('postrender', () => {
    if (theme.key !== layer.style.theme.key) return;

    distributedTheme(layer);
  });

  return theme.legend.node;
}
