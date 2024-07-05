/**
### /ui/layers/legends/graduated

The graduated theme legend module exports the graduatedTheme to the `ui.layers.legend{}` library object.

@requires /ui/elements/legendIcon

@module /ui/layers/legends/graduated
*/

/**
@function graduatedTheme

@description
The graduatedTheme method creates a `catElements[]` array with icons for each graduated theme category. The elements array is passed into a legend element assigned as `layer.style.legend` and returned from the method.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The graduated theme legend element.
*/

export default function graduatedTheme(layer) {

  const theme = layer.style.theme

  theme.legend ??= {}

  const catElements = theme.categories
    .filter(cat => cat.value !== undefined)
    .map(cat => {

      const catClass = `contents ${theme.legend?.horizontal ? 'horizontal' : ''}`

      const catIcon = mapp.ui.elements.legendIcon({
        width: 24,
        height: 24,
        ...cat.style
      })

      cat.label ??= cat.value

      return mapp.utils.html`<div 
        data-id=${cat.value}
        class=${catClass}>
        <div style="height: 24px; width: 24px; grid-column: 1;">
          ${catIcon}
        </div>
        <div class="label" style="grid-column: 2;">
          ${cat.label}
        </div>`
    })

  const classList = `contents-wrapper ${theme.legend?.layout || 'grid'} ${theme.legend?.nowrap ? 'nowrap' : ''}`    

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      <div class=${classList}>
        ${catElements}
      </div>`

  layer.style.legend ??= theme.legend.node

  if (layer.style.legend) {

    layer.style.legend.replaceChildren(...theme.legend.node.children)
  }

  return theme.legend.node;
}