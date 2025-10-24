import {
  clusterLegend,
  createLegend,
  distributedLegend,
  themeParser,
} from './utils.mjs';

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
