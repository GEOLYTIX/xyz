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

@returns {HTMLElement} Element group containing range and numeric input elements.
*/
export default function slider(params) {
  params.group_id ??= params.data_id || 'slider';

  params.data_id = 'a';

  // Name of range input to update on input.
  params.rangeInput = 'rangeInput';

  // Range inputs require a step.
  params.step ??= 1;

  // Set value to val if value is not defined.
  params.value ??= params.val;

  params.title ??= '';

  params.style ??= '';

  // Create numericInput element for formatting and numeric checks.
  const numericInput = mapp.ui.elements.numericInput(params);

  // The sliderElement property is required to update the range input on numeric input.
  params.sliderElement = mapp.utils.html.node`
    <div
      role="group"
      data-id=${params.group_id}
      title=${params.title}
      class="input-range single"
      style=${`
        --min: ${params.min};
        --max: ${params.max};
        --a: ${params.value};
        ${params.style}`}>
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
        step=${params.step}
        value=${params.value}
        oninput=${(e) => onRangeInput(e, params)}>`;

  return params.sliderElement;

  /**
  @function onRangeInput

  @description
  Assign value from range type input to associated numericInput element.

  Formatting and numeric checks will be handled by the numericInput element.

  @param {Object} e oninput event from range type input.
  @param {Object} params params object used to pass additional params to the numericInput input function.
  */
  function onRangeInput(e, params) {
    // Range type input return a string target.value.
    const val = Number(e.target.value);

    //Needed to indicate that the change is coming from a slider element
    params.onRangeInput = true;

    numericInput.value = val;

    // Trigger formatting and numeric checks.
    numericInput.dispatchEvent(new Event('change'));
  }
}
