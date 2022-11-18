export default layer => {
  layer.style.legend = mapp.utils.html.node`<div>`

  return layer.style.legend
}