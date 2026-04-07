/**
## /ui/elements/confirm

Dictionary entries:
- confirm

@requires /dictionary

Exports the confirm dialog method as mapp.ui.elements.confirm()

@requires /ui/elements/dialog

@module /ui/elements/confirm
*/

/**
@function confirm

@description
This is a confirm element to display information to the user and resolving to yes/no response.

It is a framework alternative way to using window.confirm() browser function.

```js
const confirm = await mapp.ui.elements.confirm({
   text: "Please confim changes."
})
if(confirm) {
// proceed
} else {
// prevent
}
```

@param {Object} params Params for the configuration dialog.
@property {string} [params.data_id='confirm'] The data-id attribute value for the dialog.
@property {string} [params.title] Text to display in the confirm header. Defaults to 'Confirm'.
@property {string} [params.text] Text to display in the confirm content.
@property {HTMLElement} [params.innerContent] custom HTML fragment to display in the dialog, optional. Overrides text. 
@property {string} [params.icon] Custom Material Symbols icon name to use in the header for message clarity. Defaults to 'warning'. Set empty string `icon: ''` to skip the symbol entirely.
@returns {Promise<boolean>} Returns promise which resolves to true or false whether the question was confirmed.
*/
export default function confirm(params) {
  // Fallback for compatibility with system confirm dialog.
  if (typeof params === 'string') {
    params = { text: params };
  }

  params.title ??= mapp.dictionary.confirm;

  params.data_id ??= 'confirm';

  params.icon ??= 'warning';

  // create icon span tag only if icon is not an empty string
  const el_icon =
    params.icon === ''
      ? ''
      : mapp.utils
          .html`<span class="material-symbols-outlined notranslate">${params.icon}</span>`;

  params.header = mapp.utils.html`${el_icon}${params.title}`;

  delete params.minimizeBtn;

  delete params.closeBtn;

  const btn_true = mapp.utils.html`<button 
      onclick=${(e) => {
        handle_user_action(e, true);
      }}
      class="action outlined bold">
      ${mapp.dictionary.ok}`;

  const btn_false = mapp.utils.html`<button
      onclick=${(e) => {
        handle_user_action(e, false);
      }}
      class="action outlined bold">
      ${mapp.dictionary.cancel}`;

  params.innerContent ??= mapp.utils.html`<p>${params.text}</p>`;

  params.content = mapp.utils.html`
      ${params.innerContent}
      <div class="buttons">
        ${btn_true}  
        ${btn_false}`;

  params.class ??= 'alert-confirm box-shadow no-select';

  mapp.ui.elements.dialog(params);
}

/**
@function handle_user_action

@description
Handles user response to confirm dialog.
```
@param {Object} e Click event on either of confirm window buttons.
@property {Boolean} response Boolean flag indicating the choice.
@returns {Promise} The promise will resolve to the user choice whether to proceed or cancel.
*/
function handle_user_action(e, response) {
  return new Promise((resolve, reject) => {
    e.target.closest('dialog').close();
    resolve(response);
  });
}
