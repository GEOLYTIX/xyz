export default function distributedTheme(layer) {
  layer.L.once('postrender', () => {
    mapp.ui.layers.legends.legendHelper.themeParser(layer);

    const theme = layer.style.theme;

    // If the legend is set to be hidden, exit the function.
    if (theme.hideLegend) return;

    // For each category in the theme.categories array
    for (const cat of theme.categories) {
      // For each value in the values array, create a legend entry.
      // This is as we want an individual legend entry for each distributed value in the array.
      // This is so each value can be filtered out within the legend just like categorized thematics.
      for (const val of cat.values) {
        // Create a new cat object for each value.
        const valObject = {};
        valObject.value = val;
        valObject.label = val;
        valObject.field = cat.field;
        valObject.style = cat.style;
        mapp.ui.layers.legends.legendHelper.createLegend(
          valObject,
          theme,
          layer,
        );
      }
    }

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

    return theme.legend.node;
  });
}
