/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

@requires /ui/utils/clusterLegend
@requires /ui/utils/createLegend
@requires /ui/utils/categorizedLegend
@requires /ui/utils/themeParser@requires /ui/elements/themeLegendSwitch

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
  theme.legend.switch =
    theme.field && layer.filter && mapp.ui.elements.themeLegendSwitch();

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

    //Set themes to show in style panel on layer show.
    layer.showCallbacks.push(async () => {
      layer.style.legend.style.removeProperty('display');
      theme.meta_node?.style.removeProperty('display');
    });

    //Hide distribution count themes when the layer is hidden.
    layer.hideCallbacks.push(() => {
      //Only hide the distribution count theme legend.
      if (theme.key === layer.style.theme.key) {
        layer.style.legend.style.setProperty('display', 'none');
        theme.meta_node?.style.setProperty('display', 'none');
      }
    });
  }

  //Display legend for other cases.
  layer.style.legend.style.removeProperty('display');

  return theme.legend.node;
}
