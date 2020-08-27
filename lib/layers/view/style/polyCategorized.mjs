export default _xyz => layer => {

  const legend = _xyz.utils.html.node`<div class="legend grid">`

  // Switch all control
  legend.appendChild(_xyz.utils.html.node`
    <div
      class="switch-all"
      style="font-size: 90%; grid-column: 1/3; margin-bottom: 5px;">
        Click on labels to switch visibity or 
      <a
        class="primary-colour"
        style="cursor: pointer;"
        onclick=${e => {
          e.stopPropagation()
          legend.querySelectorAll('.switch').forEach(_switch => _switch.click())
          layer.reload()
        }}>switch all</a>.`)


  // Create NI (not in) array for the current filter field if not exists.
  if (!layer.filter.current[layer.style.theme.field]) {
    layer.filter.current[layer.style.theme.field] = {
      ni: []
    }
  }

  Object.entries(layer.style.theme.cat).forEach(cat => {

    const cat_style = Object.assign({}, layer.style.default, cat[1].style || cat[1])

    const image_container = _xyz.utils.html.node`
      <div style="height: 24px; width: 24px;">`
   
    if (cat_style.fillOpacity === undefined) {

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

    legend.appendChild(_xyz.utils.html.node`
    <div
      class="label switch"
      onclick=${e => {

        e.stopPropagation()

        e.target.classList.toggle('disabled')

        if (e.target.classList.contains('disabled')) {

          // Push value into the NI (not in) legend filter.
          layer.filter.current[layer.style.theme.field].ni.push(cat[0])

        } else {

          // Splice value out of the NI (not in) legend filter.
          layer.filter
            .current[layer.style.theme.field].ni
            .splice(layer.filter.current[layer.style.theme.field].ni.indexOf(cat[0]), 1)
        }

        layer.reload()

      }}>${cat[1].label || cat[0]}`)

  })

  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    const image_container = _xyz.utils.html.node`
      <div style="height: 24px; width: 24px;">`

    if (layer.style.default.fillOpacity === undefined) {

      image_container.appendChild(_xyz.utils.svg.node`
      <svg>
      <line
        x1=4
        x2=18
        y1=10
        y2=10
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.strokeWidth || 1}>`)

    } else {

      image_container.appendChild(_xyz.utils.svg.node`
      <svg>
      <rect
        x=4
        y=2
        width=14
        height=14
        fill=${layer.style.default.fillColor || '#FFF'}
        fill-opacity=${layer.style.default.fillOpacity}
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.strokeWidth || 1}>`)
    }

    legend.appendChild(image_container)

    legend.appendChild(_xyz.utils.html.node`
    <div
      class="switch"
      onclick=${e => {

        e.stopPropagation()

        e.target.classList.toggle('disabled')

        if (e.target.classList.contains('disabled')) {

          // Assign all cat keys to IN filter.
          layer.filter.current[layer.style.theme.field].in = Object.keys(layer.style.theme.cat)
          
        } else {

          // Empty IN values filter array.
          layer.filter.current[layer.style.theme.field].in = []
        }

        layer.reload()

      }}>other`)

  }

  return legend
}