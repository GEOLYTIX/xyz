export default params => {

  const element = mapp.utils.html.node`
    <div
      role="group"
      class="input-range multi"
      style=${`
        --min: ${params.min};
        --max: ${params.max};
        --a: ${params.val_a};
        --b: ${params.val_b};`}>
      <div 
        class="label-row">
        <label>${params.label_a || 'A'}
          <input id="a" type="number"
            value=${params.val_a}
            min=${params.min}
            style="--c: var(--a)"
            oninput=${onInput}></input>
        </label>
        <label>${params.label_b || 'B'}
          <input id="b" type="number"
            value=${params.val_b}
            style="--c: var(--b)"
            oninput=${onInput}></input>
        </label>
      </div>
      <div class="track-bg"></div>
      <input id="a" type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.val_a}
        oninput=${onInput}/>
      <input id="b" type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.val_b}
        oninput=${onInput}/>`

  function onInput(e) {

    element.style.setProperty(`--${e.target.id}`, e.target.value)

    element.querySelectorAll('input')
      .forEach(el => {
        if (el.id != e.target.id) return;
        if (el == e.target) return;
        el.value = e.target.value
      })

    e.target.id === 'a'
      && typeof params.callback_a === 'function'
      && params.callback_a(e)

    e.target.id === 'b'
      && typeof params.callback_b === 'function'
      && params.callback_a(b)      

  }

  return element
}