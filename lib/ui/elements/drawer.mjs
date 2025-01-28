/**
### /ui/elements/drawer

The drawer element module exports the drawer method for the `mapp.ui.elements{}` library object.

@module /ui/elements/drawer
*/

/**
@function drawer

@description
The drawer method will create and return drawer element with a header and content.

@param {Object} params The configuration params for the drawer element.
@property {string} params.data_id The data-id for drawer element.
@property {HTML} params.header The header element[s].
@property {HTML} params.content The content element[s] for the drawer.

@returns {HTMLElement} The drawer element.
*/

export default function drawer(params) {
  params.data_id ??= 'drawer';

  params.class = `drawer expandable ${params.class || ''}`;

  const drawer = mapp.utils.html.node`
  <div 
    data-id=${params.data_id}
    class=${params.class}>
    <div
      class="header"
      onclick=${onClick}>
      ${params.header}
    </div>
    ${params.content}`;

  return drawer;

  /**
  @function onClick

  @description
  The [drawer] onClick event method will shortcircuit if the parentElement has the `empty` class.

  @param {Object} e The click event.
  */
  function onClick(e) {
    if (e.target.parentElement.classList.contains('empty')) return;

    e.target.parentElement.classList.toggle('expanded');
  }
}
