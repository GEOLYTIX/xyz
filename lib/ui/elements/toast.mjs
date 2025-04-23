/**
### /ui/elements/toast

Dictionary entries:
- information

@requires /dictionary

Exports the toast element method as mapp.ui.elements.toast()

@module /ui/elements/toast
*/

/**
@function toast

@description
This is a toast element to display information to the user.

```js
mapp.ui.elements.toast({
  text: "Drivetimes have been created."
})
```
@param {Object} params Params for the toast element.
@property {string} [params.data_id='toast'] The data-id attribute value for the element.
@property {string} [params.title] Text to display in the alert header. Defaults to 'Information'.
@property {string} [params.text] Text to display in the alert content. 
@returns {HTMLElement} toast The toast element.
*/
export default function toast(params) {
    
}