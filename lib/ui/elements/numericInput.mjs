/**
### mapp.ui.elements.numericInput()

Exports the numericInput elements method.

@module /ui/elements/numericInput
*/

/**
@function numericInput

@description
Creates a type=text input element with validation checks oninput.

@param {Object} params Parameter for the creation of the input element.
@property {string} [params.placeholder=''] The placeholder for the text input.
@property {string} [params.data_id='numeric-input'] The data id attribute for the input element.

@returns {Object} HTML input element
*/
export default function numericInput(params) {
  params.placeholder ??= '';
  params.data_id ??= 'numeric-input';
  params.numericChecks ??= numericChecks;

  const value = mapp.utils.formatNumericValue(params);
  const width = params.dynamicWidth ? value.length + 1.3 + 'ch' : '100%';
  const style = `text-align: center; width: ${width}`;

  const numericInput = mapp.utils.html.node`<input
    data-id=${params.data_id}
    type="text"
    style=${style}
    placeholder=${params.placeholder}
    value=${value}
    onchange=${(e) => oninput(e, params)}
    oninput=${(e) => oninput(e, params)}>`;

  return numericInput;
}

/**
@function oninput

@description
Creates a type=text input element with validation checks for numeric values.

The value of an associated sliderElement will be updated if validated.

@param {Object} e The event object from input element.
@param {Object} params The config object argument.
@property {Object} e.target The input element.
@property {Object} params.callback A callback method is required.
*/
function oninput(e, params) {
  // Assign stringValue from input target.
  params.stringValue = e.target.value;

  // Assign numeric newValue.
  params.newValue = params.onRangeInput
    ? params.stringValue
    : mapp.utils.unformatStringValue(params);

  if (params.numericChecks(params.newValue, params)) {
    // The numericCheck passes.
    delete params.invalid;
    e.target.classList.remove('invalid');

    // Updated sliderElement value only if validated.
    if (params.sliderElement) {
      // Set styling param for the track.
      params.sliderElement.style.setProperty(
        `--${e.target.dataset.id}`,
        params.newValue,
      );

      // Set value for the range input.
      params.sliderElement.querySelector(`[name=${params.rangeInput}]`).value =
        params.newValue;
    }
  } else {
    // The numericCheck fails.
    params.invalid = true;
    e.target.classList.add('invalid');
  }

  // The invalid input should not be formatted.
  if (params.invalid) return params.callback();

  // Pass valid newValue to callback method.
  params.callback(params.newValue);

  // Re-format the params numeric value (newValue || value) and set as input string value.
  e.target.value = mapp.utils.formatNumericValue(params);

  if (params.dynamicWidth) {
    e.target.style.width = e.target.value.length + 1.3 + 'ch';
  }
  //Mark the onRangeInput to false is the origin of the input call could come from either a slider or input
  params.onRangeInput = false;
}

/**
@function numericChecks

@description
The numericChecks method checks whether a provided numeric value is a number, larger than params.min, and smaller than params.max.

@param {Object} value The numeric value to check.
@param {Object} params The config object argument.
@property {numeric} params.min Value must be larger than min.
@property {numeric} params.max Value must be smaller than max.

@returns {Boolean} true if checks are passed.
*/
function numericChecks(value, params) {
  // Check whether value is a null.
  if (params.onRangeInput && value === null) return false;
  // Check whether value is a number.
  if (isNaN(value)) return false;

  if (params.min && value < params.min) {
    // The value is smaller than min.
    return false;
  }

  if (params.max) {
    return value <= params.max;
  }

  return true;
}
