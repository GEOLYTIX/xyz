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
  });

  return theme.legend.node;
}
