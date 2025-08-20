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
  params.group_id ??= params.data_id || 'slider_ab';

  params.step ??= 1;

  const minInputParams = {
    ...params,
    callback: params.callback_a,
    data_id: 'a',
    dynamicWidth: true,
    numericChecks,
    rangeInput: 'minRangeInput',
    value: params.val_a,
  };

  // Create numericInput element for formatting and numeric checks.
  const minNumericInput = mapp.ui.elements.numericInput(minInputParams);

  const maxInputParams = {
    ...params,
    callback: params.callback_b,
    data_id: 'b',
    dynamicWidth: true,
    numericChecks,
    rangeInput: 'maxRangeInput',
    value: params.val_b,
  };

  // Create numericInput element for formatting and numeric checks.
  const maxNumericInput = mapp.ui.elements.numericInput(maxInputParams);

  /**
  @function numericChecks

  @description
  The numericChecks method checks whether a provided numeric value is a number, larger than params.min, and smaller than params.max.

  The slider_ab numericCheck methods returns false if the 'a' slider element value exceeds the 'b' slider element value or vice versa.

  @param {Object} value The numeric value to check.
  @param {Object} params The config object argument.
  @property {numeric} params.min Value must be larger than min.
  @property {numeric} params.max Value must be smaller than max.
  @property {boolean} params.showMinMax Whether the minmax-row element should be displayed.
  @property {string} params.data_id The id of the numeric input element.

  @returns {Boolean} true if checks are passed.
  */
  function numericChecks(value, params) {
    // Check whether value is a null.
    if (value === null) return false;
    // Check whether value is a number.
    if (isNaN(value)) return false;

    //Value should be cast to number
    value = Number(value);

    if (
      params.data_id === 'a' &&
      value > Number(maxInputParams.newValue ?? maxInputParams.value)
    ) {
      return false;
    }

    if (
      params.data_id === 'b' &&
      value < Number(minInputParams.newValue ?? minInputParams.value)
    ) {
      return false;
    }

    // Check if the value is within the allowed range
    return !(value < params.min || value > params.max);
  }

  // The min max row should only be displayed with the showMinMax property flag.
  const minmaxClasslist = params.showMinMax
    ? 'minmax-row'
    : 'minmax-row display-none';

  const minLabel = mapp.utils.formatNumericValue({
    value: params.min,
    ...params,
  });
  const maxLabel = mapp.utils.formatNumericValue({
    value: params.max,
    ...params,
  });

  const element = mapp.utils.html.node`
    <div
      role="group"
      data-id=${params.group_id}
      class="input-range multi"
      style=${`
        --min: ${params.min};
        --max: ${params.max};
        --a: ${params.val_a};
        --b: ${params.val_b};`}>
      <div class="label-row">
        ${minNumericInput} ${maxNumericInput}
      </div>
      <div class="track-bg"></div>
      <div class=${minmaxClasslist}>
        <span>${minLabel}</span><span>${maxLabel}</span>
      </div>
      <input data-id="a" type="range"
        name="minRangeInput"
        min=${params.min}
        max=${params.max}
        step=${params.step}
        value=${params.val_a}
        oninput=${(e) => onRangeInput(e, params)}/>
      <input data-id="b" type="range"
        name="maxRangeInput"
        min=${params.min}
        max=${params.max}
        step=${params.step}
        value=${params.val_b}
        oninput=${(e) => onRangeInput(e, params)}/>`;

  // The sliderElement property is required to update the range input on numeric input.
  minInputParams.sliderElement = element;
  maxInputParams.sliderElement = element;

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

    // Check whether input event is from minRangeInput.
    if (e.target.dataset.id === 'a') {
      //Needed to indicate that the change is coming from a slider element
      minInputParams.onRangeInput = true;
      minNumericInput.value = val;

      // Trigger formatting and numeric checks.
      minNumericInput.dispatchEvent(new Event('change'));
    }

    // Check whether input event is from maxRangeInput.
    if (e.target.dataset.id === 'b') {
      //Needed to indicate that the change is coming from a slider element
      maxInputParams.onRangeInput = true;
      maxNumericInput.value = val;

      // Trigger formatting and numeric checks.
      maxNumericInput.dispatchEvent(new Event('change'));
    }
  }

  const range = params.max - params.min;

  if (!range) {
    return mapp.utils.html.node`<div>No available range for slider element.`;
  }

  return element;
}
