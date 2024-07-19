export default params => {

  return mapp.utils.html.node`
    <div
      role="group"
      data-id=${params.data_id || 'slider'}
      title=${params.title || ''}
      class="input-range single"
      style=${`--min: ${params.min}; --max: ${params.max}; --a: ${params.slider}; ${params.style || ''}`}>
      <div class="label-row">
        <label>${params.label}
        <input data-id="a"
          name="slider-number-input"
          type="text"
          style="text-align: right"
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
        value=${params.slider}
        oninput=${onInput}
        >`

  function onInput(e) {

    const separators = mapp.utils.getSeparators({...params.entry,...{value : 100000.9}})

    if(e.data === separators.decimals && e.target.value.includes(separators.decimals)){
      return
    }

    if(e.data === '0' && e.target.value.includes(separators.decimals) && e.target.value.lastIndexOf('0') === e.target.value.length -1 ){
      params.callback && params.callback(e)
      return 
    }

    //Get rid of the thousand separator 
    e.target.value = e.target.value.replaceAll(separators.thousands, '')

    //Swap decimal separator to '.'
    if (separators.decimals) {
      e.target.value = separators.decimals === '.' || separators.decimals === '' ? e.target.value : e.target.value.replace(separators.decimals, '.')
    }

    e.target.value = e.target.value.replace(params.entry.prefix, '').replace(params.entry.suffix, '')

    let val = parseFloat(e.target.value)

    if(isNaN(val)){
      e.target.value = null
      params.callback && params.callback(e)
      return
    }

    if(val < params.min || val > params.max){

      e.target.value =  mapp.utils.numericFormatter({...params.entry,...{ value: e.target.value }}).replace(params.entry.prefix,'').replace(params.entry.suffix,'')
      let invalidValue = e.target.value
      e.target.classList.add('invalid')

      params.entry.value = params.oldValue
      e.target.value = params.oldValue
      params.callback && params.callback(e)
      
      e.target.value = invalidValue
      return;
    }

    e.target.classList.remove('invalid')

    const group = e.target.closest('.input-range')

    e.target.value = val > params.max ? params.max : val
    group.style.setProperty(`--${e.target.dataset.id}`, e.target.value < params.min ? params.min : e.target.value)

    group.querySelectorAll('input')
      .forEach(el => {

        if (el.dataset.id != e.target.dataset.id) return;
        if (el == e.target) return;
        if(e.target.type === 'text' && el.type === 'range'){
          el.value = e.target.value
          params.entry.value = e.target.value
          e.target.value = mapp.utils.numericFormatter(params.entry).replace(params.entry.prefix,'').replace(params.entry.suffix,'')
        }        
        else{
          params.entry.value = e.target.value
          el.value = mapp.utils.numericFormatter(params.entry).replace(params.entry.prefix,'').replace(params.entry.suffix,'')
        }
      })

    params.entry.value = params.oldValue
    params.callback && params.callback(e)
  }

}