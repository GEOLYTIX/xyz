/**
Exports method to create a slider_ab element group.

@module /ui/elements/slider_ab
*/

/**
@function slider_ab

@description
The slider method creates a range slider element with two numeric input elements [a/b].

The params.value property must be between params.min and params.max params.

@param {Object} params Parameter for slider element.
@property {numeric} params.val_a Parameter value for a input.
@property {numeric} params.val_b Parameter value for b input.
@property {numeric} params.min Numeric range min.
@property {numeric} params.max Numeric range max.

@returns {HTMLElement} Element group containing range and numeric input elements.
*/
export default function slider_ab(params) {

  params.step ??= 1

  const minInputParams = {
    ...params,
    data_id: 'a',
    value: params.val_a,
    rangeInput: 'minRangeInput',
    callback: params.callback_a
  }

  // Create numericInput element for formatting and numeric checks.
  const minNumericInput = mapp.ui.elements.numericInput(minInputParams)

  const maxInputParams = {
    ...params,
    data_id: 'b',
    value: params.val_b,
    rangeInput: 'maxRangeInput',
    callback: params.callback_b
  }

  // Create numericInput element for formatting and numeric checks.
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

  // The sliderElement property is required to update the range input on numeric input.
  minInputParams.sliderElement = element 
  maxInputParams.sliderElement = element 

  /**
  @function onRangeInput

  @description
  Assign value from range type input to associated numericInput element.

  Formatting and numeric checks will be handled by the numericInput element.

  @param {Object} e oninput event from range type input.
  */
  function onRangeInput(e) {

    // Range type input return a string target.value.
    const val = Number(e.target.value)

    // Check whether input event is from minRangeInput.
    if (e.target.dataset.id === 'a') {

      minNumericInput.value = val

      // Trigger formatting and numeric checks.
      minNumericInput.dispatchEvent(new Event('change'))
    }

    // Check whether input event is from maxRangeInput.
    if (e.target.dataset.id === 'b') {

      maxNumericInput.value = val

      // Trigger formatting and numeric checks.
      maxNumericInput.dispatchEvent(new Event('change'))
    }
  }

  return element
}