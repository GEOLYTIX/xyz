/**
### /ui/elements/radio

@module /ui/elements/radio

@description
Radio is a round interactive element that allows the user to choose only one option from a predefined set of mutually exclusive choices.
Radio buttons must be organised into groups of at least 2 entries identified by their common name as they function as interdependent boolean flags.
Checking one radiobutton in a group automatically uncheckes all others.

```js const my_radio = mapp.ui.elements.radio({ label: "My only option" }); ```

In order to create radio buttons as a group:

```js
const my_radio1 = mapp.ui.elements.radio({ label: "My option 1", name: "my_group" });
const my_radio2 = mapp.ui.elements.radio({ label: "My option 2", name: "my_group" });
const my_radio3 = mapp.ui.elements.radio({ label: "My option 3", name: "my_group" });
```

@param {Object} params Configuration object
@property {String} [params.name] name attribute which identifies the group and links radio buttons as members.
@property {String} [params.data_id] Data attribute which identifies each member within the group
@property {String} [params.label] Text label to display next to radio button
@property {String} [params.caption] Text caption to display before the radio button
@property {Function} [params.onchange] 
Function to execute after the checked state within the group is changed. It takes change event and configuration params as arguments.
@returns {HTMLElement} 
*/

export default function radio(params) {
  params.name ??= 'mapp-ui-radio-element';
  params.data_id ??= 'radio';
  params.label ??= 'No label defined';

  const header = params.caption
    ? mapp.utils.html`<legend>${params.caption}`
    : '';

  const radio = mapp.utils.html.node`<input 
    type="radio"
    data-id=${params.data_id}
    name="${params.name}"
    .disabled=${!!params.disabled}
    .checked=${!!params.checked}
    onchange=${(e) => {
      params.onchange?.(e, params);
    }}/>`;

  return mapp.utils.html.node`<div>
    ${header}
    <label 
    class="radio">
    ${radio}
    <span class="material-symbols-outlined"></span>
    <span>${params.label}`;
}
