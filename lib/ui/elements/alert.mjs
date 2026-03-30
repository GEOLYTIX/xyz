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
@property {HTMLElement} [params.innerContent] custom HTML fragment to display in the dialog, optional. Overrides text.
@property {string} [params.icon] Custom Material Symbols icon name to use in the header for message clarity. Defaults to 'info'.
@returns {HTMLElement} alert The alert element.
*/
export default function alert(params) {

  // Fallback for compatibility with system alert dialog.
  if (typeof params === 'string') {
    params = { text: params };
  }

  params.title ??= mapp.dictionary.information;

  params.icon ??= 'info';

  params.data_id ??= 'alert';

  params.class ??= 'alert-confirm';

  params.header = mapp.utils
    .html`<span class="material-symbols-outlined notranslate">${params.icon}</span>${params.title}`;

  params.innerContent ??= mapp.utils.html`<p>${params.text}</p>`;

  params.content = mapp.utils.html`
    ${params.innerContent}
    <div class="buttons">
      <button 
        class="action outlined bold"
        onclick=${(e) => {
      e.target.closest('dialog').close();
    }}>${mapp.dictionary.ok}`;

  return mapp.ui.elements.dialog(params);
}
