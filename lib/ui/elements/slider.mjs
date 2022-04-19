export default params => {

  return mapp.utils.html.node`
    <div
      role="group"
      data-id=${params.data_id || 'slider'}
      title=${params.title || ''}
      class="input-range single"
      style=${`--min: ${params.min}; --max: ${params.max}; --a: ${params.val}; ${params.style || ''}`}>
      <div class="label-row">
        <label>${params.label}</label>
        <input id="a"
          type="number"
          min=${params.min}
          max=${params.max}
          value=${params.val}
          oninput=${onInput}></input>
      </div>
      <div class="track-bg"></div>
      <input id="a"
        type="range"
        min=${params.min}
        max=${params.max}
        value=${params.val}
        step=${params.step || 1}
        oninput=${onInput}>`

  function onInput(e) {

    e.target.closest('.input-range').style.setProperty(`--${e.target.id}`, e.target.value)

    e.target.closest('.input-range').querySelectorAll('input')
      .forEach(el => {
        if (el.id != e.target.id) return;
        if (el == e.target) return;
        el.value = e.target.value
      })

    params.callback && params.callback(e)

  }

}