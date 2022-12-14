export default layer => {

  const theme = layer.style.theme

  const grid = []

  theme.cat_arr.forEach(cat => {

    // Assemble cat_style from defaults and cat style.
    const cat_style = Object.assign(
      {},
      layer.style.default,
      cat.style?.icon || cat.style || cat)

    if (!cat.style?.icon) delete cat_style.icon;

    // Cat icon.
    let icon = mapp.utils.html`
      <div
        style="height: 24px; width: 24px; grid-column: 1;">
        ${mapp.ui.elements.legendIcon(
          Object.assign({ width: 24, height: 24 }, cat_style)
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