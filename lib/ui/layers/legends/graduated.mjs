/**
### /ui/layers/legends/graduated

The graduated theme legend module exports the graduatedTheme to the `ui.layers.legend{}` library object.

@requires /ui/elements/legendIcon
@requires /ui/layers/legends/utils

@module /ui/layers/legends/graduated
*/

import { catToggle, themeLegendSwitch } from './utils.mjs';

/**
@function graduatedTheme

@description
The graduatedTheme method creates a `catElements[]` array with icons for each graduated theme category. The elements array is passed into a legend element assigned as `layer.style.legend` and returned from the method.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The graduated theme legend element.
*/
export default function graduatedTheme(layer) {
  const theme = layer.style.theme;

  theme.filterOnly = true;

  theme.legend ??= {};

  // Switch all control
  const switchAll = themeLegendSwitch();

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

  const classList = `contents-wrapper ${theme.legend?.layout || 'grid'} ${
    theme.legend?.nowrap ? 'nowrap' : ''
  }`;

  // if nowrap is set, we need to allow overflow scroll in case of too many items
  const style = theme.legend?.nowrap ? 'overflow: scroll;' : '';

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${switchAll}
      <div class=${classList} style=${style}>
        ${catElements}
      </div>`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  return theme.legend.node;
}
