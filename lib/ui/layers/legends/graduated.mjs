export default (layer) => {

  const theme = layer.style.theme

  theme.legend ??= {}

  function getCatStyleIcon(cat, layer) {
    
    let cat_style;

    if (Array.isArray(cat.style?.icon)) {

      // Array style icons cannot be assigned to the default.
      cat_style = cat.style;

    } else {
      
      // Assign icon, or style as icon, or cat to the layer style default.
      cat_style = Object.assign({},
        layer.style.default,
        cat.style || cat.icon || cat
      );
    }
    
    if (!cat.style?.icon) {
      delete cat_style.icon;
    }
    
    return cat_style.icon || cat_style;
  }

  theme.legend.node = mapp.utils.html.node`
    <div class="legend-wrapper">
      <div class=${`contents-wrapper ${theme.legend?.layout || 'grid'} ${theme.legend?.nowrap ? 'nowrap' : ''}`}>
        ${theme.cat_arr
          .filter(cat => cat.value !== undefined)
          .map(cat => mapp.utils.html`
          <div data-id=${cat.value}
            class=${`contents ${theme.legend?.horizontal ? 'horizontal' : ''}`}>
              <div style="height: 24px; width: 24px; grid-column: 1;">
                ${mapp.ui.elements.legendIcon({
                  width: 24,
                  height: 24,
                  ...getCatStyleIcon(cat, layer)
                })}
              </div>
              <div class="label" style="grid-column: 2;">
                ${cat.label || cat.value}
              </div>
          </div>`
        )}
      </div>
    </div>`

  layer.style.legend = theme.legend.node
    
  return layer.style.legend;
}