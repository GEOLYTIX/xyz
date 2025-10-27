/**
### /ui/layers/legends/distributed

The dsirtibuted theme legend module exports the distributedTheme to the `ui.layers.legend{}` library object.

@requires /ui/utils/clusterLegend
@requires /ui/utils/createLegend
@requires /ui/utils/distributedLegend
@requires /ui/utils/themeParser

@module /ui/layers/legends/distributed
*/

import {
  clusterLegend,
  createLegend,
  distributedLegend,
  themeParser,
} from './utils.mjs';
/**
@function dsitributedTheme

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

  distributedLegend(layer);

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  layer.L.once('postrender', () => {
    if (theme.key !== layer.style.theme.key) return;

    distributedTheme(layer);

    //Show legend once the features are on the map.
    layer.style.legend.style.removeProperty('display');
    theme.meta_node?.style.removeProperty('display');

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
  });

  return theme.legend.node;
}
