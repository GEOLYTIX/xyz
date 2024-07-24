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

@returns {Object} HTML input element
*/

export default function numericInput(params) {

  params.maxlength ??= 256
  params.placeholder ??= ''

  const numericInput = mapp.utils.html.node`<input
    type="text"
    style="text-align: right"
    value=${mapp.utils.formatNumericValue(params)}
    oninput=${e => oninput(e, params)}>`

  return numericInput
}

/**
@function oninput

@description
Creates a type=text input element with validation checks for numeric values.

@param {Object} e The event object from input element.
@param {Object} params The config object argument.
@property {Object} e.target The input element.
@property {Object} params.callback A callback method is required.
*/
function oninput(e, params) {

  // Assign stringValue from input target.
  params.stringValue = e.target.value

  // Assign numeric newValue.
  params.newValue = mapp.utils.unformatStringValue(params)

  if (numericChecks(params.newValue, params)) {

    // The numericCheck passes.
    delete params.invalid
    e.target.classList.remove('invalid');
  } else {

    // The numericCheck fails.
    params.invalid = true
    e.target.classList.add('invalid');
  }

  // Pass the unformated string value as argument to the params.callback.
  params.callback()

  // The invalid input should not be formatted.
  if (params.invalid) return;
  
  // Re-format the params numeric value (newValue || value) and set as input string value.
  e.target.value = mapp.utils.formatNumericValue(params)
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

  // Check whether value is a number.
  if (isNaN(value)) return false;

  if (params.min && value < params.min) {

    // The value is smaller than min.
    return false
  }

  if (params.max && value > params.max) {

    // The value exceeds the max.
    return false
  }

  return true
}
