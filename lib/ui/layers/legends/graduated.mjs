export default (layer) => {

  const theme = layer.style.theme

  theme.legend ??= {}

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      <div class=${`contents-wrapper ${theme.legend?.layout || 'grid'} ${theme.legend?.nowrap ? 'nowrap' : ''}`}>
        ${theme.categories
          .filter(cat => cat.value !== undefined)
          .map(cat => mapp.utils.html`
          <div data-id=${cat.value}
            class=${`contents ${theme.legend?.horizontal ? 'horizontal' : ''}`}>
              <div style="height: 24px; width: 24px; grid-column: 1;">
                ${mapp.ui.elements.legendIcon({
                  width: 24,
                  height: 24,
                  ...cat.style
                })}
              </div>
              <div class="label" style="grid-column: 2;">
                ${cat.label || cat.value}
              </div>
          </div>`
        )}
      </div>
    </div>`

  if (layer.style.legend) {

    layer.style.legend.replaceChildren(...theme.legend.node.children)
  }

  return theme.legend.node;
}