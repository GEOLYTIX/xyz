export default _xyz => layer => {

  const legend = _xyz.utils.html.node`<div class="legend grid">`

  layer.style.theme.cat_arr.forEach(cat => {
           
    const cat_style = Object.assign({}, layer.style.default, cat.style || cat)

    const image_container = _xyz.utils.html.node`
      <div style="height: 24px; width: 24px;">`

    if(cat_style.fillOpacity === undefined) {

      image_container.appendChild(_xyz.utils.svg.node`
      <svg>
      <line
        x1=4
        x2=18
        y1=10
        y2=10
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.strokeWidth || 1}>`)

    } else {

      image_container.appendChild(_xyz.utils.svg.node`
      <svg>
      <rect
        x=4
        y=2
        width=14
        height=14
        fill=${cat_style.fillColor || '#FFF'}
        fill-opacity=${cat_style.fillOpacity}
        stroke=${cat_style.strokeColor}
        stroke-width=${cat_style.strokeWidth || 1}>`)
    }

    legend.appendChild(image_container)

    legend.appendChild(_xyz.utils.html.node`<div class="label">${cat.label || cat.value}`)

  })

  return legend
}