/**
### mapp.ui.elements.alert()

Exports the alert dialog method as mapp.ui.elements.alert()

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

@param {Object} alert The alert configuration object.
@property {string} [alert.css_style] The CSS styles to apply to the dialog dialog.
@property {string} [alert.data_id='alert'] The data-id attribute value for the dialog.
@property {string} [alert.title] Text to display in the alert header. Defaults to 'Information'.
@property {string} [alert.text] Text to display in the alert content. 
@returns {HTMLElement} alert The alert element.
*/

export default function alert(params) {

    params.title ??= 'Information';

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
    
    const alert = mapp.utils.html.node`<dialog class="alert"
    onclose=${() => {
        alert.remove();
    }}
    onclick=${e => {
      e.stopPropagation();
      alert.close();
    }}>
      <h4>${params.title}</h4>
      <p>${params.text}</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 0.2em">
      <button 
        class="raised primary-colour del bold"
        style="grid-column: 2"
        onclick=${e => {
          e.stopPropagation();
          alert.close();
        }}>${mapp.dictionary.ok}`

  document.body.append(alert);

  alert.showModal();
}