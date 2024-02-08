export default layer => {

  // This is a placeholder legend for the distributed theme.
  theme.legend.node = mapp.utils.html.node`<div>`
  
  if (layer.style.legend) mapp.utils.render(layer.style.legend, theme.legend.node)
  
  return theme.legend.node;
}