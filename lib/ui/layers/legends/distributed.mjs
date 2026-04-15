/**
### /ui/layers/legends/distributed

The distributed theme legend module exports the distributedTheme to the `ui.layers.legend{}` library object.

@requires /ui/layers/legends/utils

@module /ui/layers/legends/distributed
*/

import { catElement, clusterLegend, themeLegend } from './utils.mjs';
/**
@function distributedTheme

@description
The distributedTheme method creates and returns a distributed theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The distributed theme legend element.
*/
export default function distributedTheme(layer) {
  //Apply filterOnly so the filtering action on the theme is only visual.
  layer.style.theme.filterOnly = true;
  const theme = layer.style.theme;

  themeLegend(theme);

  // If the legend is set to be hidden, exit the function.
  if (theme.hideLegend) return;

  theme.legend.grid = [];

  // For each category in the theme.categories array
  for (const cat of theme.categories) {
    cat.label = cat.values?.join(', ');

    // Only create a legend item if the category has a label defined
    // If no label, it means that category is not being used.
    if (cat.label !== undefined) {
      theme.legend.grid.push(catElement(cat, theme, layer));
    }
  }

  if (layer.style.cluster) {
    theme.legend.grid.push(clusterLegend(layer));
  }

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      <div class=${theme.legend.classList}>
        ${theme.legend.grid}`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  // The method to rebuild the legend must be called after each render is complete.
  layer.L.once('postrender', () => {
    if (theme.key !== layer.style.theme.key) return;

    distributedTheme(layer);
  });

  return theme.legend.node;
}
