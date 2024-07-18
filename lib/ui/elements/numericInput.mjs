/**
### mapp.ui.elements.numericInput()

Exports the numericInput elements method.

@module /ui/elements/numericInput
*/

/**
@function numericInput

@description
Creates a type=text input element with validation checks.

@param {Object} params The config object argument.
@param {string} [params.data_id]
@param {string} [params.name]
@param {numeric} params.value 
@param {numeric} [params.min]
@param {numeric} [params.max]
@param {numeric} [params.step]
@param {numeric} [params.maxlength]
@param {string} [params.placeholder]
@param {Object} [params.entry] optional location entry
@param {Function} [params.callback]
function to execute on `input` event which takes current input value and entry{} as arguments. Callback will only execute with defined entry and after successful numeric validation.

@returns {Object} HTML input element
*/
export default function numericInput(params) {
  params.maxlength ??= 256
  params.step ??= 1
  let entry = params.entry
  let oldValue = entry.value

  params.formatterParams ??= entry?.formatterParams

  // Return right-aligned text input 
  return mapp.utils.html.node`
  <input
    type="text"
    style="text-align: right"
    maxlength=${entry.edit.maxlength}
    value="${mapp.utils.numericFormatter({ ...params, ...{ value: entry.newValue || entry.value } })}"
    placeholder="${entry.edit.placeholder || ''}"
    oninput=${e => {

      //Get the separators from the formatter
      const separators = mapp.utils.getSeparators(entry)

      //Determine if separator is already in the string
      let decIndex = e.target.value.indexOf(separators.decimals)
      
      //Check and remove if it id present twice
      if(decIndex > -1 && e.target.value.indexOf(separators.decimals,decIndex+1) > -1 && Object.values(separators).includes(e.data)) {  
        e.target.value = e.target.value.substring(0,e.target.value.indexOf('.',decIndex+1))
      };

      //Strip out any characters that arent numbers or the separators
      let reg = new RegExp(String.raw`[^0-9^${'\\'+separators.thousands}^${'\\'+separators.decimals}]`, 'g');
      if(entry.type === 'integer'){
        reg = new RegExp(String.raw`[^0-9^${'\\'+separators.thousands}]`, 'g');
      }
      e.target.value = e.target.value.replaceAll(reg,'')
    }}
    onkeyup=${e => {
      
      if(e.ctrlKey && e.key === 'a'){ 
        e.target.setSelectionRange(0,e.target.value.length)
        return
      }
      //Get cursor position to move it back at the end
      let cursorPos = e.target.selectionStart
      let startLength = e.target.value.length
      let appendZero = '';

      const separators = mapp.utils.getSeparators(entry)

      //Allow the typing of the decimal character in the formatterParams
      if(separators.decimals === e.key || e.key.includes('Arrow') || e.key === 'Control') {
        
        return;
      }

      //Get rid of the thousand separator 
      e.target.value = e.target.value.replaceAll(separators.thousands, '')

      //Swap decimal separator to '.'
      if (separators.decimals) {
        e.target.value = separators.decimals === '.' || separators.decimals === '' ? e.target.value : e.target.value.replace(separators.decimals, '.')
      }
      //Check that numbers are within the min and max
      let value = e.target.value
      if(!(e.key === '0' && e.target.value.includes('.') && cursorPos === e.target.value.length)){
        value = numericChecks(e,params)
      }
      else if(e.target.value.endsWith('.0')){
        appendZero = '.0'
      }
      else if(e.target.value.endsWith('0')){
        appendZero = '0'
      }

      //Set newValue to undefined if the value is invalid
      entry.newValue = e.target.classList.contains('invalid') ? undefined : value
      if(entry.newValue !== undefined && (entry.newValue || null) !== (parseFloat(oldValue) || null)){
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', { detail: entry }))
      }

      //Reformat output to formatterParams
      e.target.value = `${mapp.utils.numericFormatter({ ...params, ...{ value: value } })}${appendZero}`
      e.target.value = e.target.value === 'null' ? null : e.target.value

      //Put the cursor back where it was
      let newPos = Math.round((cursorPos/startLength)*e.target.value.length)
      e.target.setSelectionRange(newPos, newPos)
  }}>`
}

function numericChecks(e,params) {

  if (!params.entry) return;

  //Temporarily remove invalid class
  e.target.classList.remove('invalid');

  let value = parseFloat(e.target.value);

  // Set value as null for empty string value.
  if (e.target.value === '') {
    value = null;
  }

  if (params.entry.type === 'integer') {
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