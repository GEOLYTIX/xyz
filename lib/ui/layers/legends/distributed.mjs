export default function distributedTheme(layer) {
  layer.L.once('postrender', () => {
    mapp.ui.layers.legends.legendHelper.themeParser(layer);

    const theme = layer.style.theme;

    theme.categories.forEach((cat) => {
      // For each value in the values array, create a legend entry.
      cat.values?.forEach((val) => {
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
      });
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
  });
}
