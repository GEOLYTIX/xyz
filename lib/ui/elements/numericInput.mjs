/**
### mapp.utils.numericInput()

Exports the numericInput elements method.

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

  if(params.formatter) {
    
    const container = mapp.utils.html.node`<div 
    class="val"
    style="position: relative; height: 2em;"
    onclick=${e => {
      e.stopPropagation();
      displayValue.classList.add('display-none');
      numericInput.classList.remove('display-none');
      numericInput.focus();
    }}
    >`;

    let changeDelay;

    const numericInput =  mapp.utils.html.node`
    <input 
    class="${params.value === null ? `` : `display-none`}"
    style="position: absolute; top: 0; left: 0"
    type="number" 
    data-id=${params.data_id}
    name=${params.name}
    value=${params.value}
    min=${params.min}
    max=${params.max}
    step=${params.step}
    maxlength=${params.maxlength}
    placeholder=${params.placeholder}
    onkeyup=${e => {
      if(e.which === 13) refreshDisplay();
    }}
    oninput=${
      e => {
        numericChecks(e);
        if(changeDelay) {
          clearTimeout(changeDelay);
          changeDelay = null;
        }
        changeDelay = setTimeout(() => refreshDisplay(), 1200);
      }
    }
    onchange=${e => {
      if(changeDelay) {
        clearTimeout(changeDelay);
        changeDelay = null;
      }
      changeDelay = setTimeout(() => refreshDisplay(), 1200);
    }}
    onblur=${() => {
      changeDelay = setTimeout(() => refreshDisplay(), 1200);
    }}>`

    const displayValue = mapp.utils.html.node`<div
    style="
    position: absolute; 
    top: 0; 
    left: 0; 
    background-color: #fff;
    border: 1px solid #ccc; 
    padding: 5px;
    width: 100%; 
    text-align: right; 
    pointer-events: none;"
    >${formatValue()}`

    function formatValue(val) {
      if(val === undefined) return mapp.utils.numericFormatter(params);
      return mapp.utils.numericFormatter({ ...params, ...{value: val} })
    }

    container.appendChild(displayValue);
    container.appendChild(numericInput);

    function refreshDisplay() {
      displayValue.textContent = formatValue(numericInput.value)
      displayValue.classList.remove('display-none');
      displayValue.style.backgroundColor = "var(--color-changed)";
      numericInput.classList.add('display-none');
    }

    return container;
  }

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
    oninput=${numericChecks}>`

  function numericChecks(e) {

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