document.dispatchEvent(new CustomEvent('theme_slider', { detail: addModule }))

function addModule(_xyz) {

  const graduatedTheme = _xyz.layers.view.style.themes.graduated

  _xyz.layers.view.style.themes.graduated = layer => {

    const legend = graduatedTheme(layer)

    if (layer.style.theme.theme_slider) {

      legend.style['grid-template-columns'] = 'min-content 1fr'

      const arrFields = [
        'unique_dev_0',
        'unique_dev_1',
        'unique_dev_2',
        'unique_dev_3',
        'unique_dev_4',
        'unique_dev_5',
        'unique_dev_6',
        'unique_dev_7',
        'unique_dev_8',
        'unique_dev_9',
        'unique_dev_10',
        'unique_dev_11',
        'unique_dev_12',
        'unique_dev_13',
        'unique_dev_14',
        'unique_dev_15',
        'unique_dev_16',
        'unique_dev_17',
        'unique_dev_18',
        'unique_dev_19',
        'unique_dev_20',
        'unique_dev_21',
        'unique_dev_22',
        'unique_dev_23'
      ]

      legend.appendChild(_xyz.utils.html.node`
      <label class="input-checkbox" style="margin-top: 12px; grid-column: 1/3;">
      <input
        type="checkbox"
        onchange=${e => {
          if (e.target.checked) {

            const slider = document.getElementById('mancs_hx_hour_slider')

            layer.style.theme.loop = setInterval(()=>{
              slider.value++
              if (slider.value == 23) slider.value = 0
              slider.dispatchEvent(new Event('input'))
            }, 500)

          } else {
            clearInterval(layer.style.theme.loop)
          }
        }}>
      </input>
      <div></div><span>24 hour loop`);

      legend.appendChild(_xyz.utils.html.node`
      <div style="grid-column: 1/3;">
        <span>Hour: </span>
        <span class="bold">0</span>
        <div class="input-range">
        <input id="mancs_hx_hour_slider"
          class="secondary-colour-bg"
          type="range"
          min=0
          value=0
          max=23
          step=1
          oninput=${e => {
            layer.style.theme.field = arrFields[e.target.value]
            e.target.parentNode.previousElementSibling.textContent = e.target.value
            layer.L.setStyle(layer.L.getStyle())
          }}>`)

      legend.appendChild(_xyz.utils.html.node`
      <div style="margin-top: 12px; grid-column: 1/3;">
        <span>Opacity: </span>
        <span class="bold">1</span>
        <div class="input-range">
        <input
          class="secondary-colour-bg"
          type="range"
          min=0
          value=1
          max=1
          step=0.1
          oninput=${e => {
            layer.L.setOpacity(parseFloat(e.target.value))
            e.target.parentNode.previousElementSibling.textContent = parseFloat(e.target.value)
          }}>`)          

    }

    return legend

  }

}