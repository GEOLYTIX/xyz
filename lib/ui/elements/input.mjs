/**
### mapp.ui.elements.input()
Module that returns an input UI element used in mapp.
@module /ui/elements/input
*/

/**
Creates a number input element.
@function input
@param {Object} params The config object argument.
@param {Object} params.entry optional location entry
@param {Function} [params.callback] function to execute on keyup event which takes event and entry{} as arguments. 
@returns {Object} HTML input element
*/
export default params => {

   function numericChecks(e) {
    
      // remove invalid css
      e.target.classList.remove('invalid');

      let value;

      // set value as null if input blank or NaN
      if(e.target.value === '') {
        value = null;
      } else {
        value = Number(e.target.value);
      }

      console.log(value);

      if (params.entry?.type === 'integer') {
        value = parseInt(value);
      }

      if(params.min) {
        if(value < params.min) {
          e.target.classList.add('invalid');
          return;
        }
      }

      if(params.max) {
        if(value > params.max) {
          e.target.classList.add('invalid');
          return;
        }
      }

      if(!params.entry) return;
      params.callback?.(value, params.entry);

   }

    return mapp.utils.html.node`<input 
    type="number" 
    value=${params.value}
    min=${params.min}
    max=${params.max}
    step=${params.step || 1}
    maxlength=${params.maxlength || 256}
    placeholder=${params.placeholder}
    onkeyup=${
        e => {
            numericChecks(e);
        }
    }
    onblur=${e => {
      if(e.target.value === '') e.target.classList.remove('invalid');
    }}
    >`
}