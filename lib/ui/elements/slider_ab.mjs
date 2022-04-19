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
            style="--c: var(--a)"></input>
        </label>
        <label>${params.label_b || 'B'}
          <input id="b" type="number"
            value=${params.val_b}
            style="--c: var(--b)"></input>
        </label>
      </div>
      <div class="track-bg"></div>
      <input id="a" type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.val_a}
        oninput=${e=>{

          e.target.parentNode.style.setProperty(`--${e.target.id}`, e.target.value)
            
          e.target.parentNode.querySelectorAll('input')
              .forEach(el => {
                if (el.id != e.target.id) return;
                if (el == e.target) return;
                el.value = e.target.value
            })
          
          params.callback_a && params.callback_a(e)
        }}/>
      <input id="b" type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.val_b}
        oninput=${e=>{

          e.target.parentNode.style.setProperty(`--${e.target.id}`, e.target.value)
            
          e.target.parentNode.querySelectorAll('input')
              .forEach(el => {
                if (el.id != e.target.id) return;
                if (el == e.target) return;
                el.value = e.target.value
            })
          
          params.callback_b && params.callback_b(e)
        }}/>`

  return element
}