/**
### /ui/layers/legends/basic

The basic theme legend module exports the basicTheme to the `ui.layers.legend{}` library object.

@requires /ui/elements/legendIcon

@module /ui/layers/legends/basic
*/

/**
@function basicTheme

@description
The basicTheme method creates and returns a basic theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/

export default function basicTheme(layer) {
  const theme = layer.style.theme;

  theme.legend ??= {};

  theme.legend.grid = [];

  // Make 'left' default alignment.
  theme.legend.alignContents ??= 'left';
  theme.legend.alignContents += ' contents';

  layer.style.theme.style ??= {};
  layer.style.theme.style.width ??= 24;
  layer.style.theme.style.height ??= 24;

  const legendIcon = mapp.ui.elements.legendIcon(layer.style.theme.style);

  const icon = mapp.utils.html`<div>${legendIcon}`;

  theme.legend.grid.push(mapp.utils.html`
    <div 
      class="contents">
      ${icon}<div class="label" style="grid-column: 2";>${layer.style.theme.label}`);

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
    <div class="contents-wrapper grid">${theme.legend.grid}`;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  return theme.legend.node;
}
