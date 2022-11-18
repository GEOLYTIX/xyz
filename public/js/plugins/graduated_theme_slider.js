export default (function () {

  // Create a clone of the original style method.
  const graduatedStyleFunction = mapp.ui.layers.legends.graduated.bind({});

  // Re-assign a new method for graduated themes.
  mapp.ui.layers.legends.graduated = layer => {

    // First run the clone of the original method.
    graduatedStyleFunction(layer)

    let loop_chkbox, hour_slider, transparency_slider

    // Check whether the graduated theme slider elements should be created.
    if (layer.style.theme.theme_slider && layer.style.theme.fields) {

      let loopInterval

      loop_chkbox = mapp.ui.elements.chkbox({
        label: '24 hour loop',
        onchange: (checked) => {

          if (checked) {

            let slider = hour_slider.querySelector('input')

            loopInterval = setInterval(() => {
              slider.value++
              if (slider.value == 23) slider.value = 0
              slider.dispatchEvent(new Event('input'))
            }, 800)

          } else {
            clearInterval(loopInterval)
          }
        }
      })

      let styleTimeout

      hour_slider = mapp.ui.elements.slider({
        label: 'Hour:',
        min: 0,
        max: 23,
        val: 0,
        callback: e => {

          if (styleTimeout) clearTimeout(styleTimeout)

          layer.style.theme.field = layer.style.theme.fields[parseInt(e.target.value)]

          styleTimeout = setTimeout(() => {
            layer.L.setStyle(layer.L.getStyle())
          }, 300)

        }
      })

      transparency_slider = mapp.ui.elements.slider({
        label: 'Transparency:',
        min: 0,
        max: 1,
        val: 1,
        step: 0.1,
        callback: e => {

          layer.L.setOpacity(parseFloat(e.target.value))

        }
      })

      // Re-render the layer.style.legend with the additional elements.
      layer.style.legend = mapp.utils.html.node`<div class="content">
        ${layer.style.legend}
        ${loop_chkbox}
        ${hour_slider}
        ${transparency_slider}`
    }

    return layer.style.legend
  }

})()