export default layer => {

  const grid = []

  let icon = mapp.utils.html`
  <div
    style="height: 24px; width: 24px;">
    ${mapp.ui.elements.legendIcon(
      Object.assign({ width: 24, height: 24 }, Object.assign({}, layer.style.default, layer.style.theme.style))
    )}`;

  grid.push(mapp.utils.html`
    <div 
      class="contents">
      ${icon}<div class="label">${layer.style.theme.label}`)

  theme.legend.node = mapp.utils.html.node`
    <div class='legend>
    <div class="contents-wrapper grid">${grid}`

  if (layer.style.legend) mapp.utils.render(layer.style.legend, theme.legend.node)
  
  return theme.legend.node;
}