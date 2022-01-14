export default _xyz => layer => {

  const theme = layer.style.theme

  const legend = _xyz.utils.html.node`<div class="legend">`

  legend.appendChild(_xyz.utils.html.node`
  <button class="btn-drop">
  <div
    class="head"
    onclick=${e => {
      e.preventDefault()
      e.target.parentElement.classList.toggle('active')
    }}>
    <span>${theme.fields[0]}</span>
    <div class="icon"></div>
  </div>
  <ul>${theme.fields.map(field => _xyz.utils.html`
    <li onclick=${e=>{
      const drop = e.target.closest('.btn-drop')
      drop.classList.toggle('active')
      drop.querySelector(':first-child').textContent = field

      // layer.grid_size = keyVal[1]
      layer.reload()
      }}>${field}`)}`)

  theme.a.forEach(cat => {

    console.log(cat)
           
    //const cat_style = Object.assign({}, layer.style.default, (cat.style && cat.style.marker || cat.style) || cat)

    // legend.appendChild(_xyz.utils.html.node`
    //   <img style="grid-column: 1" height=24 src="${_xyz.utils.svg_symbols(cat.style.marker)}">`)
  

  })

  return legend

}