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
const toast = mapp.ui.elements.toast({
	logo: "https://geolytix.github.io/public/mapp_v4/emblem.svg",
	content: 'Hello from ui toast!',
	actions: [{
		label: 'Accept',
		value: 'true',
		classlist: 'bold raised accept',
		callback: (e, params) => console.log(e)
	  },
	  {
		label: 'Reject',
		classlist: 'bold raised reject',
		value: 'false',
		callback: (e, params) => console.log(e)
	  }]
});
```

Without any actions provided the toast element will disappear after a timeout params in ms.

@param {Object} params Params for the toast element.
@property {array} [params.actions] An array of action objects to generate toast element buttons.
@property {string} [params.data_id='ui-elements-toast'] The data-id attribute value for the element.
@property {string} [params.logo] A src string for a logo element.
@property {string} [params.timeout=3000] A toast with out action elements will disappear after the timeout in ms.
@property {boolean} [params.close] An optional button to close the toast will be added to the toast element.
@property {string} [params.accept] Shorthand for accept button. String value will be used for the label.
@property {string} [params.cancel] Shorthand for cancel button. String value will be used for the label.
@property {string} [params.classlist] list of classes to apply on the button, optional. Example: "raised bold accept".
@property {HTMLElement} [params.content] HTML to display in the toast container. Can be text with links etc. Defaults to generic text.
@returns {Promise} The promise will resolve to the value of the button element.
*/
export default function toast(params = {}) {
  params.data_id ??= 'ui-elements-toast';
  params.content ??= 'Set custom HTML content in element configuration.';

  params.actions ??= [];

  if (params.accept) {
    params.actions.push({
      label: typeof params.accept === 'string' ? params.accept : 'Accept',
    });
  }

  if (params.cancel) {
    params.actions.push({
      label: typeof params.accept === 'string' ? params.cancel : 'Cancel',
    });
  }

  return new Promise((resolve) => {
    let closeBtn;
    if (params.close) {
      closeBtn = mapp.utils.html`
        <button class="notranslate material-symbols-outlined close"
          onclick=${hide_toast}>`;
    }

    const actions = params.actions?.map((action) => {
      // default styling if unset
      action.classlist ??= 'bold raised primary';
      // Use label property as default for value.
      action.value ??= action.label;
      return mapp.utils.html`<button class="${action.classlist}"
        value=${action.value}
        onclick=${(e) => hide_toast(e, action)}>${action.label}`;
    });

    if (!actions.length) {
      params.timeout ??= 3000;

      setTimeout(hide_toast, params.timeout);
    }

    const logo =
      params.logo &&
      mapp.utils.html`<div class="toast-logo"><img src=${params.logo}>`;

    const container = mapp.utils.html.node`
      <div data-id=${params.data_id} class="toast">
      ${closeBtn}
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

      if (action?.callback instanceof Function) action.callback(e);

      resolve(e?.target.value);
    }
  });
}
