/**
### mapp.ui.elements.numericInput()

Exports the numericInput elements method.

@module /ui/elements/numericInput
*/

/**
@function numericInput

@description
Creates a type=text input element with validation checks for numeric values.

@param {Object} params The config object argument.
@property {string} [params.data_id]
@property {numeric} params.value 
@property {numeric} [params.min]
@property {numeric} [params.max]
@property {numeric} [params.step]
@property {numeric} [params.maxlength]
@property {string} [params.placeholder]

@returns {Object} HTML input element
*/

export default function numericInput(params) {

  params.maxlength ??= 256
  params.step ??= 1
  params.oldValue = params.value
  params.placeholder ??= ''
  params.separators ??= mapp.utils.getSeparators(params)

  const value = mapp.utils.numericFormatter({
    ...params,
    ...{
      value: params.newValue || params.value
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

function oninput(e, params) {

  //Determine if separator is already in the string
  let decIndex = e.target.value.indexOf(params.separators.decimals)

  //Check and remove if it id present twice
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

function onkeyup(e, params) {

  if (e.ctrlKey && e.key === 'a') {
    e.target.setSelectionRange(0, e.target.value.length)
    return
  }
  //Get cursor position to move it back at the end
  let cursorPos = e.target.selectionStart
  let startLength = e.target.value.length

  //Allow the typing of the decimal character in the formatterParams
  if (params.separators.decimals === e.key || e.key.includes('Arrow') || e.key === 'Control') {

    return;
  }

  const decLength = e.target.value.substring(e.target.value.indexOf(params.separators.decimals) + 1).length

  if (e.key === '0'
    && e.target.value.lastIndexOf('0') === e.target.value.length - 1
    && e.target.value.includes(params.separators.decimals)
    && decLength <= (params.round || params.formatterParams.precision)) {

    if (params.newValue !== undefined 
      && (params.newValue || null) !== (parseFloat(params.oldValue) || null)) {

        console.log(params)
    }

    return
  }

  //Get rid of the thousand separator 
  e.target.value = e.target.value.replaceAll(params.separators.thousands, '')

      //Swap decimal separator to '.'
      separators.decimals ??= '.'
      e.target.value = separators.decimals === '.' || separators.decimals === '' ? e.target.value : e.target.value.replace(separators.decimals, '.')

      //Check that numbers are within the min and max
      let value = numericChecks(e,params)

  //Set newValue to undefined if the value is invalid
  params.newValue = e.target.classList.contains('invalid') ? undefined : value;

  if (params.newValue !== undefined && (params.newValue || null) !== (parseFloat(params.oldValue) || null)) {

    console.log(params)
    // params.location.view?.dispatchEvent(new CustomEvent('valChange', { detail: params }))

  }

  //Reformat output to formatterParams
  e.target.value = `${mapp.utils.numericFormatter({ ...params, ...{ value: value } })}`

  e.target.value = e.target.value === 'null' ? null : e.target.value

  //Put the cursor back where it was
  let newPos = Math.round((cursorPos / startLength) * e.target.value.length)

  e.target.setSelectionRange(newPos, newPos)
}

function numericChecks(e, params) {

  //Temporarily remove invalid class
  e.target.classList.remove('invalid');

  let value = parseFloat(e.target.value);

  // Set value as null for empty string value.
  if (e.target.value === '') {
    value = null;
  }

  if (params.type === 'integer') {
    value = parseInt(value);
  }

  if(params.min || params.max){

    if(params.min > value || value > params.max){

      e.target.classList.add('invalid');
      e.target.parentElement.parentElement.parentElement.querySelector('.btn-save').style.display = 'none'
      e.target.parentElement.classList.remove('val-changed');
      return value;
    }
  }

  return value
}
