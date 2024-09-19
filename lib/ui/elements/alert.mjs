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

    const alert = mapp.utils.html.node`<dialog class="mapp-says"
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