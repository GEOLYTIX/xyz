/**
## /ui/elements/chkbox

Exports the default chkbox element method as mapp.ui.elements.chkbox()

@module /ui/elements/chkbox
*/

/**
@function chkbox

@description
The chkbox element method will create a label HTMLElement with a nested checkbox type input element.

The onchange method provided as params property will be executed if the checkbox input element is toggled.

@param {Object} params Parameter for the chkbox input element and label.
@property {string} params.label The string for the chkbox label span.
@property {string} [params.data_id] The string value assigned as data-id label element property.
@property {function} [params.onchange] The method called by the input element onchange event.
@property {boolean} [params.disabled] The input element is disabled.
@property {boolean} [params.checked] The checkbox input element is checked.
@returns {HTMLElement} Chkbox label with input element.
*/
export default function chkbox(params) {
  params.data_id ??= 'chkbox';

  const chkbox = mapp.utils.html.node`<label 
    data-id=${params.data_id}
    class="checkbox">
    <input
      name="mapp-ui-chkbox-element"
      type="checkbox"
      .disabled=${!!params.disabled}
      .checked=${!!params.checked}
      onchange=${(e) => {
        params.onchange?.(e.target.checked, params.val);
      }}/>
    <span class="notranslate material-symbols-outlined"/>
    <span>${params.label}`;

  return chkbox;
}
