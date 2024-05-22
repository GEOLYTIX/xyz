export default params => {

  return mapp.utils.html.node`
    <div
      role="group"
      data-id=${params.data_id || 'slider'}
      title=${params.title || ''}
      class="input-range single"
      style=${`--min: ${params.min}; --max: ${params.max}; --a: ${params.val}; ${params.style || ''}`}>
      <div class="label-row">
        <label>${params.label}
        <input data-id="a"
          name="slider-number-input"
          type="number"
          min=${params.min}
          max=${params.max}
          step=${params.step || 1}
          value=${params.val}
          oninput=${onInput}></input>
        </label>
      </div>
      <div class="track-bg"></div>
      <input data-id="a"
        name="slider-range-input"
        type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.val}
        oninput=${onInput}>`

  function onInput(e) {

    let val = parseFloat(e.target.value)

    if (isNaN(val) || val < params.min) {
      
      e.target.classList.add('invalid')
      return;
    }

    if (val > params.max) {
      e.target.classList.add('invalid')
      return;
    }

    e.target.classList.remove('invalid')

    const group = e.target.closest('.input-range')

    e.target.value = val;

    group.style.setProperty(`--${e.target.dataset.id}`, val)

    group.querySelectorAll('input')
      .forEach(el => {
        if (el.dataset.id != e.target.dataset.id) return;
        if (el == e.target) return;
        el.value = val
      })

    params.callback && params.callback(e)
  }

}