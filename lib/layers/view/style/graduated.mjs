export default _xyz => layer => {

  const legend = _xyz.utils.html.node`<div class="legend grid">`

  layer.style.theme.cat_arr.forEach(cat => {
           
    const cat_style = Object.assign({}, layer.style.default, cat.style || cat)

    if (cat_style.svg || cat_style.type) {
  
      legend.appendChild(_xyz.utils.html.node`
      <img style="grid-column: 1" height=24 src="${_xyz.utils.svg_symbols(cat_style)}">`)
  
    } else if (cat_style.fillOpacity === undefined) {

      legend.appendChild(_xyz.utils.svg.node`
      <svg height=24 width=24>
      <line
        x1=0 y1=0 x2=24 y2=24
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.strokeWidth || 1}>`)

    } else {

      legend.appendChild(_xyz.utils.svg.node`
      <svg height=24 width=24>
      <rect
        width=24 height=24
        fill=${cat_style.fillColor || '#FFF'}
        fill-opacity=${cat_style.fillOpacity}
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.strokeWidth || 1}>`)
    }

    legend.appendChild(_xyz.utils.html.node`
    <div  style="grid-column: 2" class="label">${cat.label || cat.value}`)

  })

  return legend
}