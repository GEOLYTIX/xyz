export default layer => {

  const theme = layer.style.theme

  const grid = []

  theme.cat_arr.forEach(cat => {

    const cat_style = Array.isArray(cat.style?.icon)

      // Array style icons cannot be assigned to the default.
      ? cat.style

      // Assign icon, or style as icon, or cat to the layer style default.
      : Object.assign({},
        layer.style.default,
        cat.style || cat.icon || cat);     

    if (!cat.style?.icon) delete cat_style.icon;   

    // Cat icon.
    let icon = mapp.utils.html`
      <div
        style="height: 24px; width: 24px; grid-column: 1;">
        ${mapp.ui.elements.legendIcon(
          Object.assign({ width: 24, height: 24 }, cat_style.icon || cat_style)
        )}`;

    // Cat label.
    let label = mapp.utils.html`
      <div class="label" style="grid-column: 2;">${cat.label || cat.value}`

    // Push icon and label into legend grid.
    grid.push(mapp.utils.html`
      <div 
        data-id=${cat.value}
        class="contents">
        ${icon}${label}`)

  })

  layer.style.legend = mapp.utils.html.node`<div class="grid">${grid}`

  return layer.style.legend
}