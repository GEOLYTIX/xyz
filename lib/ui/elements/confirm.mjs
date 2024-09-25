/**
## /ui/elements/confirm

Exports the confirm dialog method as mapp.ui.elements.confirm()

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

@param {Object} confirm The confirm configuration object.
@property {string} [confirm.data_id='confirm'] The data-id attribute value for the dialog.
@property {string} [confirm.title] Text to display in the confirm header. Defaults to 'Confirm'.
@property {string} [confirm.text] Text to display in the confirm content. 
@returns {Promise<boolean>} Returns promise which resolves to true or false whether the question was confirmed.
*/

mapp.utils.merge(mapp.dictionaries, {
  en: {
    confirm: 'Confirm'
  }
});

export default function confirm(params) {

  params.title ??= `${mapp.dictionary.confirm}`;

  const btn_true = mapp.utils.html.node`
    <button class="raised primary-colour bold">${mapp.dictionary.ok}`;

  const btn_false = mapp.utils.html.node`
    <button class="raised primary-colour bold">${mapp.dictionary.cancel}`

  mapp.ui.elements.dialog({
    data_id: 'confirm',
    class: 'alert-confirm',
    closeOnClick: true,
    onClose: (e) => {
      e.target.remove()
    },
    header: mapp.utils.html.node`<h4>${params.title}`,
    content: mapp.utils.html.node`<p>${params.text}</p>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 0.2em">
      ${btn_true}  
      ${btn_false}`
  })

  return new Promise((resolve, reject) => {

    btn_true.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelector('dialog.alert-confirm[data-id="confirm"]').close();
      resolve(true);
    });

    btn_false.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelector('dialog.alert-confirm[data-id="confirm"]').close();
      resolve(false);
    });
  });
}
