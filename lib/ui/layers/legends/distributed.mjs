export default layer => {

  const theme = layer.style.theme

  theme.legend ??= {}

  theme.legend.grid = []

  // Make 'left' default alignment.
  theme.legend.alignContents ??= 'left'
  theme.legend.alignContents += ' contents'

  // This is a placeholder legend for the distributed theme.
  theme.legend.node = mapp.utils.html.node`<div>`

  if (layer.style.legend) mapp.utils.render(layer.style.legend, layer.style.theme.legend.node)

  return layer.style.theme.legend.node;
}