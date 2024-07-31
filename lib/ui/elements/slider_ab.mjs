export default params => {

  params.step ??= 1

  const minInputParams = {
    ...params,
    data_id: 'a',
    value: params.val_a,
    rangeInput: 'minRangeInput',
    callback: params.callback_a
  }

  const minNumericInput = mapp.ui.elements.numericInput(minInputParams)

  const maxInputParams = {
    ...params,
    data_id: 'b',
    value: params.val_b,
    rangeInput: 'maxRangeInput',
    callback: params.callback_b
  }

  const maxNumericInput = mapp.ui.elements.numericInput(maxInputParams)

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
          ${minNumericInput}</label>
        <label>${params.label_b || 'B'}
          ${maxNumericInput}</label>
      </div>
      <div class="track-bg"></div>
      <input data-id="a" type="range"
        name="minRangeInput"
        min=${params.min}
        max=${params.max}
        step=${params.step}
        value=${params.val_a}
        oninput=${onRangeInput}/>
      <input data-id="b" type="range"
        name="maxRangeInput"
        min=${params.min}
        max=${params.max}
        step=${params.step}
        value=${params.val_b}
        oninput=${onRangeInput}/>`

  
  minInputParams.sliderElement = element 
  maxInputParams.sliderElement = element 

  function onRangeInput(e) {

    const val = parseFloat(e.target.value)

    if (e.target.dataset.id === 'a') {

      minNumericInput.value = val
      minNumericInput.dispatchEvent(new Event('change'))
    }

    if (e.target.dataset.id === 'b') {

      maxNumericInput.value = val
      maxNumericInput.dispatchEvent(new Event('change'))
    }
  }

  return element
}