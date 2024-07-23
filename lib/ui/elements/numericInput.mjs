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

  params.stringValue = e.target.value

  // Pass the unformated string value as argument to the params.callback.
  params.callback(mapp.utils.unformatStringValue(params))
  
  // Re-format the params.numericValue and set as target.value.
  e.target.value = mapp.utils.formatNumericValue(params)
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

function _oninput(e, params) {

  //Determine if separator is already in the string
  const decIndex = e.target.value.indexOf(params.separators.decimals)

  //Check duplicate separator characters and remove duplicated isntances
  if (decIndex > -1
    && e.target.value.indexOf(params.separators.decimals, decIndex + 1) > -1
    && Object.values(params.separators).includes(e.data)) {
    e.target.value = e.target.value.substring(0, e.target.value.indexOf('.', decIndex + 1))
  };

  // Define expression to replace seperators.
  const reg = params.type === 'integer'
    ? new RegExp(String.raw`[^0-9^${'\\' + params.separators.thousands}]`, 'g')
    : new RegExp(String.raw`[^0-9^${'\\' + params.separators.thousands}^${'\\' + params.separators.decimals}]`, 'g')

  e.target.value = e.target.value.replaceAll(reg, '')

  typeof params.oninput === 'function' && params.oninput(e)
}

function _onkeyup(e, params) {

  if (e.ctrlKey && e.key === 'a') {
    e.target.setSelectionRange(0, e.target.value.length)
    return
  }

  //Get cursor position to move it back at the end
  const cursorPos = e.target.selectionStart
  const startLength = e.target.value.length

  //Allow the typing of the decimal character in the formatterParams
  if (params.separators.decimals === e.key || e.key.includes('Arrow') || e.key === 'Control') {

    return;
  }

  const decLength = e.target.value.substring(e.target.value.indexOf(params.separators.decimals) + 1).length

  //If the user inputs .0 on 9234 this will wait until they type 9234.01
  //Will also allow users to input to a max of specified decimal places (default: 2)
  if(e.key === '0' && decLength < params.round && cursorPos === e.target.value.length) return

  //Get rid of the thousand separator 
  e.target.value = e.target.value.replaceAll(params.separators.thousands, '')

  //Swap decimal separator to '.'
  params.separators.decimals ??= '.'
  e.target.value = params.separators.decimals === '.' || params.separators.decimals === '' ? e.target.value : e.target.value.replace(params.separators.decimals, '.')

  //Check that numbers are within the min and max
  const value = numericChecks(e,params)

  //Set newValue to undefined if the value is invalid
  params.invalid = e.target.classList.contains('invalid')

  //Reformat output to formatterParams
  e.target.value = `${mapp.utils.numericFormatter({ ...params, ...{ value: value } })}`

  e.target.value = e.target.value === 'null' ? null : e.target.value

  //Put the cursor back where it was
  const newPos = Math.round((cursorPos / startLength) * e.target.value.length)
  e.target.setSelectionRange(newPos, newPos)

  params.newValue = value
  typeof params.callback === 'function' && params.callback(value)
}

function numericChecks(e, params) {

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
