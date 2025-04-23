/**
### /ui/elements/toast

Dictionary entries:
- ok
- accept
- reject

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
  content: 'This is some news for you!',
  information: true
})
```
@param {Object} params Params for the toast element.
@property {string} [params.data_id='ui-elements-toast'] The data-id attribute value for the element.
@property {HTMLElement} [params.content] HTML to display in the toast container. Can be text with links etc. Defaults to generic text.
@property {Boolean} [params.information] Set information to true to use only 'OK' button.
@returns {HTMLElement} toast The toast element.
*/
export default function toast(params) {
  params.data_id ??= 'ui-elements-toast';
  params.content ??= 'Set custom HTML content in element configuration.';
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

  const container = mapp.utils.html
    .node`<div data-id=${params.data_id} class="toast">
    <div class="toast-logo">
        <img src="https://geolytix.github.io/public/mapp_v4/emblem.svg">
    </div>
    ${params.content}
    <div class="actions">
    ${params.actions}
    </div>
    `;

  document.body.append(container);

  // display flag set later to allow smooth animation
  container.style.display = 'block';

  function hide_toast(e) {
    container.classList.add('before-remove');

    // element removed in a timeout so that hide smooth animation can complete
    setTimeout(function () {
      container.remove();
    }, 1200);

    resolve(e.target.value);
  }
}
