/**
Exports method to create a slider element group.

@module /ui/elements/slider
*/

/**
@function slider

@description
The slider method creates a numeric input element nested in a group with an associated range slider element.

The params.value property must be between params.min and params.max params.

@param {Object} params Parameter for slider element.
@property {numeric} params.value Parameter value.
@property {numeric} params.min Numeric range min.
@property {numeric} params.max Numeric range max.

@returns {HTMLElement} Element group containing a range and numeric input elements.
*/
export default function slider(params) {

  params.data_id = 'a'

  const numericInput = mapp.ui.elements.numericInput(params)

  params.sliderElement = mapp.utils.html.node`
    <div
      role="group"
      data-id=${params.data_id || 'slider'}
      title=${params.title || ''}
      class="input-range single"
      style=${`
        --min: ${params.min};
        --max: ${params.max};
        --a: ${params.value};
        ${params.style || ''}`}>
      <div class="label-row">
        <label>${params.label}
        ${numericInput}
        </label>
      </div>
      <div class="track-bg"></div>
      <input data-id="a"
        name="rangeInput"
        type="range"
        min=${params.min}
        max=${params.max}
        step=${params.step || 1}
        value=${params.value}
        oninput=${onSliderInput}>`

  return params.sliderElement

  /**
  @function onSliderInput

  @description
  Parses float value from range input event and assigns value to the numeric input element.

  Calls change event on numeric input for formatting and checking.

  @param {Object} e oninput event from range type input.
  */
  function onSliderInput(e) {

    const val = parseFloat(e.target.value)

    numericInput.value = val

    numericInput.dispatchEvent(new Event('change'))
  }
}