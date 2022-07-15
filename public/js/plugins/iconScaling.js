export default (function () {

  mapp.ui.layers.panels.iconScaling = layer => {

    let timeout

    const elements = []

    elements.push(mapp.utils.html.node`
      ${mapp.ui.elements.slider({
        label: 'Scale',
        min: 0,
        max: layer.style.default.scale + layer.style.default.scale * 3,
        step: layer.style.default.scale / 20,
        val: layer.style.default.scale,
        callback: e => {
          layer.style.default.scale = parseFloat(e.target.value)
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
        }
      })
    }`)


    if(layer.style.default.zoomInScale) elements.push(mapp.utils.html.node`
      ${mapp.ui.elements.slider({
        label: "Zoom-in Scale",
        min: 0,
        max: 0.3,
        step: 0.03,
        val: layer.style.default.zoomInScale,
        callback: e => {
          layer.style.default.zoomInScale = parseFloat(e.target.value)
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
        }
      })
    }`)


    const drawer = mapp.ui.elements.drawer({
      header: mapp.utils.html`
        <h3>Icon Scaling</h3>
        <div class="mask-icon expander"></div>`,
      class: 'raised',
      content: mapp.utils.html`${elements}`
    })

    return drawer

  }
  

})()