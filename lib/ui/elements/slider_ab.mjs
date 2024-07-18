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
            oninput=${onInput}}></input>
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
    let currMax;
    let currMin;
    const replaceValue = e.target.dataset.id === 'b' ? params.max : params.min
    e.target.value = e.target.value === '' ? replaceValue : e.target.value;

    //Determine thousand and decimal markers
    const separators = mapp.utils.getSeparators(params.entry) || {decimals: '.'}

    //Ignore empty values or if the user just typed `1.` for example.  
    //Until they type `1.1`.
    const stringValue = e.target.value.toString()
    
    if(stringValue[0] === '-' && stringValue.length === 1) return; 
    
    if(params.entry.type !== 'integer'){
      if(stringValue.substring(stringValue.indexOf(separators.decimals), stringValue.length) === separators.decimals ) return; 
    }
    
    //Get the number value and the formatted value
    const numericValue = Number(e.target.value) || mapp.utils.numericFormatter({...params.entry, ...{value: e.target.value, undo: true}})
    let value = Number(numericValue)

    e.target.value = value > params.max ? params.max : value
    element.style.setProperty(`--${e.target.dataset.id}`, e.target.value < params.min ? params.min : e.target.value)
    
    element.querySelectorAll('input')
      .forEach(el => {
        if (el.dataset.id != e.target.dataset.id) return;
        if (el == e.target) return;
        if(e.target.type === 'text' && el.type === 'range'){
          el.value = value
          params.entry.value = value
          e.target.value = mapp.utils.numericFormatter(params.entry)
        }
        else{
          params.entry.value = e.target.value
          el.value = mapp.utils.numericFormatter({...params.entry,...{value: e.target.value }})
        }
        if(el.dataset.id === 'a'){
          currMin = Number(el.value) || e.target.value
          currMin = currMin < params.min ? params.max : currMin;
        }
        if(el.dataset.id === 'b'){
          currMax = Number(el.value) || e.target.value
          currMax = currMax > params.max ? params.max : currMax;
        }
      })

    e.target.dataset.id === 'a'
      && typeof params.callback_a === 'function'
      && params.callback_a(currMin)

    e.target.dataset.id === 'b'
      && typeof params.callback_b === 'function'
      && params.callback_b(currMax)      

  }

  return element
}