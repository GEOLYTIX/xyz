/**
### /ui/elements/card

@module /ui/elements/card
*/

/**
@function card

@description
The card element method creates a drawer class card which can be closed but not collapsed to the header.

The element is assigned as card property to the params.

@param {Object} params Params for the card element.
@property {Function} [params.close] Callback method to execute when a card element is closed.

@returns {HTMLElement} card element.
*/
export default function card(params) {
  params.data_id ??= 'card';

  const card = mapp.utils.html.node`
  <div 
    data-id=${params.data_id}
    class="drawer">
    <header class="header bold">
      <span>${params.header}</span>
      <button
        class="notranslate material-symbols-outlined color-font-mid"
        onclick=${(e) => {
          e.target.closest('.drawer').remove();
          if (typeof params.close === 'function') {
            params.close(e);
          }
        }}>close</button>
    </header>
    ${params.content}`;

  return card;
}
