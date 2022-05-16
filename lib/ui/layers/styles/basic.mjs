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

  layer.style.legend = mapp.utils.html.node`<div class="grid">${grid}`

  return layer.style.legend
}