/**
### /ui/elements/radio
Radio is a round interactive element that allows the user to choose only one option from a predefined set of mutually exclusive choices.
Radio buttons must be organised into groups of at least 2 entries identified by their common name as they function as interdependent boolean flags.
Checking one radiobutton in a group automatically uncheckes all others.

```js const my_radio = mapp.ui.elements.radio({ label: "My only option" }); ```

In order to create radio buttons as a group:

```js
const my_radio1 = mapp.ui.elements.radio({ label: "My option 1", name: "my_group" });
const my_radio2 = mapp.ui.elements.radio({ label: "My option 2", name: "my_group" });
const my_radio3 = mapp.ui.elements.radio({ label: "My option 3", name: "my_group" });
js

@module /ui/elements/radio
*/

export default function radio(params) {
  params.name ??= 'mapp-ui-radio-element';
  params.data_id ??= 'radio';

  const header = params.caption
    ? mapp.utils.html`<legend>${params.caption}`
    : '';

  const radio = mapp.utils.html.node`<input 
    type="radio"
    name="${params.name}"
    .disabled=${!!params.disabled}
    .checked=${!!params.checked}
    onchange=${(e) => {
      params.onchange?.(e.target.checked, params);
    }}/>`;

  return mapp.utils.html.node`<div>
    ${header}
    <label 
    data-id=${params.data_id}
    class="radio">
    ${radio}
    <span class="material-symbols-outlined"></span>
    <span>${params.label}`;
}
