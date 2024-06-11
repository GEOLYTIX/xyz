/**
### mapp.ui.elements.numericInput()

Exports the numericInput method as mapp.ui.elements.numericInput()

@module /ui/elements/numericInput
*/

/**
@function numericInput

@description
Creates a type=number input element with validation checks.

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
function to execute on keyup event which takes event and entry{} as arguments.

@returns {Object} HTML input element
*/

export default function numericInput(params) {

  params.maxlength ??= 256
  params.step ??= 1

  return mapp.utils.html.node`<input 
    type="number" 
    data-id=${params.data_id}
    name=${params.name}
    value=${params.value}
    min=${params.min}
    max=${params.max}
    step=${params.step}
    maxlength=${params.maxlength}
    placeholder=${params.placeholder}
    oninput=${numericChecks}
    onblur=${e => {
      if (e.target.value === '') e.target.classList.remove('invalid');
    }}>`

  function numericChecks(e) {

    // remove invalid css
    e.target.classList.remove('invalid');

    let value;

    // Set value as null for empty string value.
    if (e.target.value === '') {
      value = null;

    } else {
      value = Number(e.target.value);
    }

    if (params.entry?.type === 'integer') {
      value = parseInt(value);
    }

    if (params.min) {
      if (value < params.min) {
        e.target.classList.add('invalid');
        return;
      }
    }

    if (params.max) {
      if (value > params.max) {
        e.target.classList.add('invalid');
        return;
      }
    }

    if (!params.entry) return;

    params.callback?.(value, params.entry);
  }
}