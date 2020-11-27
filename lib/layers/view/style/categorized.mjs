export default _xyz => layer => {

  const legend = _xyz.utils.html.node`<div class="legend grid">`

  // layer.style.theme.title && legend.appendChild(_xyz.utils.html.node`
  //   <span class="title">${layer.style.theme.title}`)

  // Switch all control
  legend.appendChild(_xyz.utils.html.node`
    <div
      class="switch-all label"
      style="grid-column: 1/3;">
        ${_xyz.language.layer_style_switch_caption}
      <a
        class="primary-colour"
        style="cursor: pointer;"
        onclick=${e => {
          e.stopPropagation()
          legend.querySelectorAll('.switch').forEach(_switch => _switch.click())
          layer.reload()
        }}>${_xyz.language.layer_style_switch_all}</a>.`)

  if (!layer.filter.current[layer.style.theme.field]) {
    layer.filter.current[layer.style.theme.field] = {}
  }

  Object.entries(layer.style.theme.cat).forEach(cat => {

    const cat_style = Object.assign({}, layer.style.default, cat[1].style || cat[1])

    if (cat_style.svg || cat_style.type) {
  
      legend.appendChild(_xyz.utils.html.node`
      <img height=24 src="${_xyz.utils.svg_symbols(cat_style)}">`)

    } else if (cat_style.fillOpacity === undefined) {

      legend.appendChild(_xyz.utils.svg.node`
      <svg height=24 width=24>
      <line
        x1=0 y1=12 x2=24 y2=12
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
    <div
      class="label switch"
      onclick=${e => {

        e.stopPropagation()

        e.target.classList.toggle('disabled')

        if (e.target.classList.contains('disabled')) {

          if (!layer.filter.current[layer.style.theme.field].ni) {
            layer.filter.current[layer.style.theme.field].ni = []
          }

          // Push value into the NI (not in) legend filter.
          layer.filter
            .current[layer.style.theme.field].ni
            .push(cat[0])

        } else {

          // Splice value out of the NI (not in) legend filter.
          layer.filter
            .current[layer.style.theme.field].ni
            .splice(layer.filter.current[layer.style.theme.field].ni.indexOf(cat[0]), 1)

            if (!layer.filter.current[layer.style.theme.field].ni.length) {
              delete layer.filter.current[layer.style.theme.field].ni
            }
        }

        layer.reload()

      }}>${cat[1].label || cat[0]}`)

  })

  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    if (layer.style.default.svg || layer.style.default.type) {
  
      legend.appendChild(_xyz.utils.html.node`
      <img height=24 src="${_xyz.utils.svg_symbols(layer.style.default)}">`)

    } else if (layer.style.default.fillOpacity === undefined) {

      legend.appendChild(_xyz.utils.svg.node`
      <svg height=24 width=24>
      <line
        x1=0 y1=12 x2=24 y2=12
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.strokeWidth || 1}>`)

    } else {

      legend.appendChild(_xyz.utils.svg.node`
      <svg height=24 width=24>
      <rect
        width=24 height=24
        fill=${layer.style.default.fillColor || '#FFF'}
        fill-opacity=${layer.style.default.fillOpacity}
        stroke=${layer.style.default.strokeColor}
        stroke-width=${layer.style.default.strokeWidth || 1}>`)
    }

    legend.appendChild(_xyz.utils.html.node`
    <div
      class="label switch"
      onclick=${e => {

        e.stopPropagation()

        e.target.classList.toggle('disabled')

        if (e.target.classList.contains('disabled')) {

          // Assign all cat keys to IN filter.
          layer.filter.current[layer.style.theme.field].in = Object.keys(layer.style.theme.cat)
          
        } else {

          // Empty IN values filter array.
          delete layer.filter.current[layer.style.theme.field].in
        }

        layer.reload()

      }}>${_xyz.language.layer_style_other}`)

  }

  // Attach row for cluster locations.
  if (layer.style.cluster) {
  
    legend.appendChild(_xyz.utils.html.node`
    <img height=40 src="${_xyz.utils.svg_symbols(layer.style.cluster)}">`)
   
    legend.appendChild(_xyz.utils.html.node`
    <div class="label" style="alignment-baseline:central;">${_xyz.language.layer_style_cluster}`)
  }

  return legend
}