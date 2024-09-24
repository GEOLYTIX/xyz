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

@param {Object} alert The alert configuration object. Created with mapp.ui.elements.dialog.
@property {string} [alert.title] Text to display in the alert header. Defaults to 'Information'.
@property {string} [alert.text] Text to display in the alert content. 
@returns {HTMLElement} alert The alert element.
*/

export default function alert(params) {

    params.title ??= 'Information';

    return mapp.ui.elements.dialog({
      class: 'alert-confirm',
      closeOnClick: true,
      onClose: (e) => {
        e.target.remove();
      },
      header: mapp.utils.html.node`<h4>${params.title}`,
      content: mapp.utils.html.node`<p>${params.text}</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 0.2em">
      <button 
      class="raised primary-colour bold" style="grid-column: 2"
      onclick=${e => {
        e.stopPropagation();
        document.querySelector('dialog.alert-confirm').close();
      }}>${mapp.dictionary.ok}`

    })
}