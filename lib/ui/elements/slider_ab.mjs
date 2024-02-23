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
          <input data-id="a" type="text"
            value=${params.val_a}
            min=${params.min}
            max=${params.max}
            style="--c: var(--a);text-align:end"
            oninput=${onInput}></input>
        </label>
        <label>${params.label_b || 'B'}
          <input data-id="b" type="text"
            value=${params.val_b}
            min=${params.min}
            max=${params.max}
            style="--c: var(--b);text-align:end"
            oninput=${onInput}></input>
        </label>
      </div>
      <div class="track-bg"></div>
      <input data-id="a" type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.slider_a}
        oninput=${onInput}/>
      <input data-id="b" type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.slider_b}
        oninput=${onInput}/>`

  function onInput(e) {
    e.target.value = e.target.value > params.max ? params.max : e.target.value;

    element.style.setProperty(`--${e.target.dataset.id}`, e.target.value)
    
    element.querySelectorAll('input')
      .forEach(el => {
        if (el.dataset.id != e.target.dataset.id) return;
        if (el == e.target) return;
        el.value = mapp.ui.elements.getVal(params.entry,e.target.value)
      })

    e.target.dataset.id === 'a'
      && typeof params.callback_a === 'function'
      && params.callback_a(e)

    e.target.dataset.id === 'b'
      && typeof params.callback_b === 'function'
      && params.callback_b(e)      

  }

  return element
}