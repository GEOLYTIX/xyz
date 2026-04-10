/**
### /ui/elements/alert

Dictionary entries:
- information

@requires /dictionary

Exports the alert dialog method as mapp.ui.elements.alert()

@requires /ui/elements/dialog

@module /ui/elements/alert
*/

/**
@function alert

@description
This is an alert element to display information to the user.

It is a framework alternative way to using window.alert() browser function.

```js
mapp.ui.elements.alert({
  text: "Drivetimes have been created."
})
```
@param {Object} params Params for the alert dialog.
@property {string} [params.data_id='alert'] The data-id attribute value for the dialog.
@property {string} [params.title] Text to display in the alert header. Defaults to 'Information'.
@property {string} [params.text] Text to display in the alert content. 
@returns {HTMLElement} alert The alert element.
*/
export default function alert(params) {
  params.title ??= `${mapp.dictionary.information}`;

  params.data_id ??= 'alert';

  params.class ??= 'alert-confirm';

  params.header = mapp.utils.html`
    <h4>${params.title}`;

  params.content = mapp.utils.html`
    <p>${params.text}</p>
    <div class="buttons">
      <button 
        class="raised bold"
        style="grid-column: 1/3; margin: 0 5em;"
        onclick=${(e) => {
          e.target.closest('dialog').close();
        }}>${mapp.dictionary.ok}`;

  return mapp.ui.elements.dialog(params);
}
