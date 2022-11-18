export default (function () {

  mapp.ui.layers.panels.visualAdjustment = layer => {

    let timeout

    const elements = []

    elements.push(colorInput({
      title: 'Fill Colour',
      field: 'fillColor'
    }))

    elements.push(mapp.utils.html.node`
      ${mapp.ui.elements.slider({
        label: 'Fill Opacity',
        min: 0,
        max: 1,
        step: 0.1,
        val: layer.style.default['fillOpacity'],
        callback: e => {
          layer.style.default.fillOpacity = parseFloat(e.target.value)
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
        }
      })
    }`)

    elements.push(colorInput({
      title: 'Stroke Colour',
      field: 'strokeColor'
    }))

    elements.push(mapp.utils.html.node`
      ${mapp.ui.elements.slider({
        label: 'Stroke Width',
        min: 1,
        max: 10,
        step: 1,
        val: isNaN(layer.style.default['strokeWidth']) ? 1 : layer.style.default['strokeWidth'],
        callback: e => {
          layer.style.default.strokeWidth = parseInt(e.target.value)
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
        }
      })
    }`)

    elements.push(mapp.utils.html.node`
      ${mapp.ui.elements.slider({
        label: 'Stroke Opacity',
        min: 0,
        max: 1,
        step: 0.1,
        val: isNaN(layer.style.default['opacity']) ? 1 : layer.style.default['opacity'],
        callback: e => {
          layer.style.default.strokeOpacity = parseFloat(e.target.value)
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
        }
      })
    }`)

    if(layer.style.label) elements.push(textInput({
      title: 'Label Style',
      style: 'label',
      field: 'font',
      placeholder: layer.style.label.font || '12px sans-serif'
    }))


    const drawer = mapp.ui.elements.drawer({
      header: mapp.utils.html`
        <h3>Visual Adjustment</h3>
        <div class="mask-icon expander"></div>`,
      class: 'raised',
      content: mapp.utils.html`${elements}`
    })


    function textInput(params) {

      return mapp.utils.html.node`<div>${params.title}</div>
      <div>
      <input style="font-family: inherit;"
      placeholder="${params.placeholder}"
      value=${layer.style[params.style || 'default'][params.field]}
      onchange=${e => {
        layer.style[params.style || 'default'][params.field] = e.target.value
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
      }}></div>`                

    }

    function colorInput(params) {

      let styleStr = 'border-radius: 4px;' + (params.colour ? `border-color: ${layer.style[params.style || 'default'][params.field]};` : '')

      return mapp.utils.html.node`<div>${params.title}</div>
      <div style="${styleStr}">
      <input type="color" style="font-family: inherit;"
      placeholder="${params.placeholder}"
      value=${layer.style.default[params.field]}
      onchange=${e => {
          layer.style.default[params.field] = e.target.value
          clearTimeout(timeout)
          timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
      }}></div>`                

    }

    return drawer

  }
  

})()