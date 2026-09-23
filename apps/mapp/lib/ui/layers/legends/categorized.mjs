/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

@requires /ui/layers/legends/utils

@module /ui/layers/legends/categorized
*/

import {
  catElement,
  clusterLegend,
  renderLegend,
  themeLegend,
  themeLegendSwitch,
} from './utils.mjs';

/**
@function categorizedTheme

@description
The categorizedTheme method creates and returns a categorized theme legend for the current layer.style.theme.

The legend of a theme with a data distribution is not created until the distribution has been processed from the layer data. The legend would otherwise create the icons for every category in the theme configuration, which may be thousands of categories not present in the data. The check is made here rather than only in the drawLegend method, since a legend method may be called directly, eg. from a plugin.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/
export default function categorizedTheme(layer) {
  if (!mapp.layer.featureFields.distributionReady(layer)) return;

  const theme = layer.style.theme;

  themeLegend(theme);

  theme.legend.grid = theme.categories
    .map((cat) => {
      return catElement(cat, theme, layer);
    })
    .filter((el) => el !== undefined);

  if (layer.style.cluster) {
    theme.legend.grid.push(clusterLegend(layer));
  }

  const switchAll = themeLegendSwitch();

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${switchAll}
      <div class=${theme.legend.classList}>
        ${theme.legend.grid}`;

  renderLegend(layer, theme.legend.node);

  return theme.legend.node;
}
