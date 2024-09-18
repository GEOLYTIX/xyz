/**
### mapp.ui.elements.confirm()

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
@property {string} [confirm.data_id='alert'] The data-id attribute value for the dialog.
@property {string} [confirm.title] Text to display in the confirm header. Defaults to 'Confirm'.
@property {string} [confirm.text] Text to display in the confirm content. 
@returns {HTMLElement} confirm The confirm element.
*/

export default function confirm(params) {

    params.title ??= 'Confirm';

    const css = `
    dialog.alert {
      margin: auto;
      box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
      border: none !important;
      border-radius: 2px;
      min-width: 350px;
      max-width: 70%;
      max-height: 70%;
      z-index: 1001;
      user-select: none;
    }

    dialog.alert::-webkit-scrollbar {
      display: none;
    }

    dialog.alert h4 {
      padding: 0.5em 1em;
      position: sticky;
      top: 0;
      left: 0;
      z-index: 10001;
      background-color: var(--color-primary);
      border-bottom: solid 2px var(--color-primary-light);
      color: var(--color-light)
    }

    dialog.alert div {
      padding: 1em;
    }

    dialog.alert p {
      white-space: pre;
      text-align: center;
      padding: 1em;
    }

    dialog.alert button {
      float: right;
      font-size: 0.9em;
      color: var(--color-primary);
      z-index: 1005;
    }

    dialog.alert:focus {
      outline: none;
    }
    `;

    document.head.prepend(mapp.utils.html.node`<style>${css}`)
    
    const btn_true = mapp.utils.html.node`<button class="raised primary-colour del bold">${mapp.dictionary.ok}`;
    
    const btn_false = mapp.utils.html.node`<button class="raised primary-colour bold">${mapp.dictionary.cancel}`
    
    const confirm = mapp.utils.html.node`<dialog class="alert" 
    onclose=${() => {
        confirm.remove();
    }}
    onclick=${e => {
        e.preventDefault();
        confirm.close();
    }}>
    <h4>${params.title}</h4>
    <p>${params.text}</p>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 0.2em">
    ${btn_false}
    ${btn_true}`;
    
    document.body.append(confirm);

    confirm.showModal();
    
    return new Promise((resolve, reject) => {
        
        btn_true.addEventListener("click", (e) => {
            e.stopPropagation();
            confirm.close();
            resolve(true);
        });
        
        btn_false.addEventListener("click", (e) => {
            e.stopPropagation();
            confirm.close();
            resolve(false);
        });
    });
}