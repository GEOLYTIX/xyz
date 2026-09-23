/**
### /ui/layers/legends/graduated

The graduated theme legend module exports the graduatedTheme to the `ui.layers.legend{}` library object.

@requires /ui/elements/legendIcon
@requires /ui/layers/legends/utils

@module /ui/layers/legends/graduated
*/

import {
  catToggle,
  renderLegend,
  themeLegend,
  themeLegendSwitch,
} from './utils.mjs';

/**
@function graduatedTheme

@description
The graduatedTheme method creates a `catElements[]` array with icons for each graduated theme category. The elements array is passed into a legend element assigned as `layer.style.legend` and returned from the method.

The legend of a theme with a data distribution is not created until the distribution has been processed from the layer data. The category values and labels of a jenks distribution are assigned from the layer data.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The graduated theme legend element.
*/
export default function graduatedTheme(layer) {
  if (!mapp.layer.featureFields.distributionReady(layer)) return;

  const theme = layer.style.theme;

  theme.filterOnly = true;

  themeLegend(theme);

  theme.legend ??= {};

  const catElements = theme.categories
    .filter((cat) => cat.value !== undefined)
    .map((cat) => {
      const catClass = `contents ${
        theme.legend?.horizontal ? 'horizontal' : ''
      }`;

      const catIcon = mapp.ui.elements.legendIcon({
        height: 24,
        width: 24,
        ...(cat._style || cat.style),
      });

      cat.label ??= cat.value;

      const labelClassList = `label switch ${cat.disabled ? 'disabled' : ''}`;

      return mapp.utils.html`<div 
        data-id=${cat.value}
        class=${catClass}>
        <div 
          style="height: 24px; width: 24px; grid-column: 1;">
          ${catIcon}
        </div>
        <div 
          class=${labelClassList}
          style="grid-column: 2;"
          onclick=${(e) => catToggle(e, layer, cat)}>
          ${cat.label}`;
    });

  const switchAll = themeLegendSwitch();

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${switchAll}
      <div class=${theme.legend.classList}>
        ${catElements}`;

  renderLegend(layer, theme.legend.node);

  return theme.legend.node;
}
