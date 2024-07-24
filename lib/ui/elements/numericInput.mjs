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

function _numericChecks(e, params) {

  //Assign min and max from entry
  const min = params.edit?.min || params.min
  const max = params.edit?.max || params.max

  // Set value as null for empty string value.
  if (e.target.value === '') {
    return null;
  }
  
  //Temporarily remove invalid class
  e.target.classList.remove('invalid');

  let value = parseFloat(e.target.value);

  if (params.type === 'integer') {
    value = parseInt(value);
  }

  //If min and max are present check for validity
  if(min || max){

    if(min > value || value > max){

      e.target.classList.add('invalid');
      return value;

    }
  }

  return value
}

function _numericInput(params) {

  params.maxlength ??= 256
  params.step ??= 1
  params.oldValue = params.value
  params.placeholder ??= ''
  params.separators ??= mapp.utils.getSeparators(params)
  params.round ??= params.formatterParams.precision || 2

  const value = mapp.utils.numericFormatter({
    ...params,
    ...{
      value: params.value
    }
  })

  // Return right-aligned text input 
  return mapp.utils.html.node`<input
    type="text"
    style="text-align: right"
    maxlength=${params.maxlength}
    value=${value}
    placeholder=${params.placeholder}
    data-id=${params.data_id}
    oninput=${e => oninput(e, params)}
    onkeyup=${e => onkeyup(e, params)}>`
}
