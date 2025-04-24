/**
### /ui/elements/toast

Exports the toast element method as mapp.ui.elements.toast()

@module /ui/elements/toast
*/

/**
@function toast

@description
The toast method creates and appends a toast HTMLElement to the document body.

The method returns a promise which will resolve to the value of a button element defined in the actions array.

```js
const toast = await mapp.ui.elements.toast({
  content: 'Hello from ui toast!',
  actions: [{
    label: 'OK',
    value: 'OK',
    callback: (e, params) => console.log(e)
  }],
  logo: "https://geolytix.github.io/public/mapp_v4/emblem.svg"
});
```
@param {Object} params Params for the toast element.
@property {array} [params.actions] An array of action objects to generate toast element buttons.
@property {string} [params.data_id='ui-elements-toast'] The data-id attribute value for the element.
@property {string} [params.logo] A src string for a logo element.
@property {HTMLElement} [params.content] HTML to display in the toast container. Can be text with links etc. Defaults to generic text.
@returns {Promise} The promise will resolve to the value of the button element.
*/
export default function toast(params) {
  params.data_id ??= 'ui-elements-toast';
  params.content ??= 'Set custom HTML content in element configuration.';

  return new Promise((resolve) => {

    const actions = params.actions?.map((action) => {
      action.value ?? action.label
      return mapp.utils.html`<button 
        value=${action.value}
        onclick=${(e) => hide_toast(e, action)}>${action.label}`;
    });

    if (params.information) {
      params.actions = mapp.utils.html`
        <button value="true"
          onclick=${hide_toast}>${mapp.dictionary.ok}
        </button>`;

    } else {
      params.actions = mapp.utils.html`
        <button class="accept" value="true"
          onclick=${hide_toast}>${mapp.dictionary.accept}
        </button>
        <button class="reject" value="false"
          onclick=${hide_toast}>${mapp.dictionary.reject}
        </button>`;
    }

    const logo =
      params.logo &&
      mapp.utils.html`<div class="toast-logo"><img src=${params.logo}>`;

    const container = mapp.utils.html.node`
      <div data-id=${params.data_id} class="toast">
      ${logo}
      ${params.content}
      <div class="actions">
      ${actions}
      </div>`;

    document.body.append(container);

    function hide_toast(e, action) {
      container.classList.add('ease-out');

      // element removed in a timeout so that hide smooth animation can complete
      setTimeout(function () {
        container.remove();
      }, 1200);

      if (action.callback instanceof Function) action.callback(e)

      resolve(e.target.value);
    }
  });
}
