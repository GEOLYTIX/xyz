/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

@requires /ui/layers/legends/utils
@requires /ui/elements/themeLegendSwitch

@module /ui/layers/legends/categorized
*/

import {
  clusterLegend,
  createLegend,
  distributedLegend,
  themeParser,
} from './utils.mjs';

/**
@function categorizedTheme

@description
The categorizedTheme method creates and returns a categorized theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/
export default function categorizedTheme(layer) {
  themeParser(layer);

  const theme = layer.style.theme;

  // Switch all control
  theme.legend.switch = layer.filter && mapp.ui.elements.themeLegendSwitch();

  theme.categories.forEach((cat) => {
    createLegend(cat, theme, layer);
  });

  if (layer.style.cluster) {
    clusterLegend(layer);
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
    distributedLegend(layer);

    return theme.legend.node;
  }

  // TODO: why is this needed?
  // layer.style.legend.style.removeProperty('display');

  return theme.legend.node;
}
