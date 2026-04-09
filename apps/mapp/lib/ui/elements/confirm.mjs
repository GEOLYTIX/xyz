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
@returns {Promise<boolean>} Returns promise which resolves to true or false whether the question was confirmed.
*/
export default function confirm(params) {
  return new Promise((resolve, reject) => {
    params.title ??= `${mapp.dictionary.confirm}`;

    params.data_id ??= 'confirm';

    params.header = mapp.utils.html`<h4>${params.title}`;

    delete params.minimizeBtn;

    delete params.closeBtn;

    const btn_true = mapp.utils.html`<button 
      onclick=${(e) => {
        e.target.closest('dialog').close();
        resolve(true);
      }}
      class="raised bold">
      ${mapp.dictionary.ok}`;

    const btn_false = mapp.utils.html`<button
      onclick=${(e) => {
        e.target.closest('dialog').close();
        resolve(false);
      }}
      class="raised bold">
      ${mapp.dictionary.cancel}`;

    params.content ??= mapp.utils.html`
      <p>${params.text}</p>
      <div class="buttons">
        ${btn_true}  
        ${btn_false}`;

    params.class ??= 'alert-confirm box-shadow';

    mapp.ui.elements.dialog(params);
  });
}
