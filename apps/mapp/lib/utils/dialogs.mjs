/**
## /utils/dialogs

The dialogs module exports alert and confirm methods which are bound to the window.alert() and window.confirm() browser functions.

The methods accept the same params as the mapp.ui.elements.alert() and mapp.ui.elements.confirm() methods. The ui module assigns the ui elements as mapp.utils.alert and mapp.utils.confirm when loaded.

MAPP modules must call mapp.utils.alert() and mapp.utils.confirm() so that they can be used without the MAPP.UI library.

@module /utils/dialogs
*/

/**
@function alert

@description
The alert method shows the params text in a window.alert() browser dialog.

```js
mapp.utils.alert({
  text: 'Drivetimes have been created.'
})
```

@param {Object|string} params Params for the alert dialog or the alert text.
@property {string} [params.text] Text to display in the alert.
@property {HTMLElement} [params.innerContent] Custom HTML whose text content is displayed if no text is provided.
*/
export function alert(params) {
  window.alert(dialogText(params));
}

/**
@function confirm
@async

@description
The confirm method shows the params text in a window.confirm() browser dialog.

The method resolves to the boolean response like the async mapp.ui.elements.confirm() method.

```js
const confirmed = await mapp.utils.confirm({
  text: 'Please confirm changes.'
})
```

@param {Object|string} params Params for the confirm dialog or the confirm text.
@property {string} [params.text] Text to display in the confirm dialog.
@property {HTMLElement} [params.innerContent] Custom HTML whose text content is displayed if no text is provided.
@returns {Promise<boolean>} Resolves to true if the dialog was confirmed.
*/
export async function confirm(params) {
  return window.confirm(dialogText(params));
}

/**
@function dialogText

@description
The dialogText method returns the text for a browser dialog from the dialog params.

@param {Object|string} params Params for the dialog or the dialog text.
@returns {string} The dialog text.
*/
function dialogText(params) {
  if (typeof params === 'string') return params;

  return params?.text ?? params?.innerContent?.textContent ?? '';
}
