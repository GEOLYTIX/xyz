/**
### /ui/elements/card

@module /ui/elements/card
*/

/**
@function card

@description
tbc
change header div to header
check on close() type

@param {Object} params Params for the card element.
@property {Function} [params.close] Callback method to execute when a card element is closed.

@returns {HTMLElement} card element.
*/
export default function card(params) {
  return mapp.utils.html.node`
  <div 
    data-id=${params.data_id || 'card'}
    class="drawer">
    <div class="header bold">
      <span>${params.header}</span>
      <button
        data-id=close
        class="mask-icon close"
        onclick=${e => {
          e.target.closest('.drawer').remove()
          params.close && params.close(e)
        }}>
    </div>
    ${params.content}`;

}
