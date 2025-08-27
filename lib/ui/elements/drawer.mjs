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
@property {boolean} [params.popout] Whether the drawer can be popped out into a dialog.
@property {HTMLElement} [params.view] The layer view the drawer is in.
@returns {HTMLElement} The drawer element.
*/

export default function drawer(params) {
  params.data_id ??= 'drawer';

  params.class = `drawer expandable ${params.class || ''}`;

  params.drawer = mapp.utils.html.node`
  <div 
    data-id=${params.data_id}
    class=${params.class}>
    <div
      class="header"
      onclick=${onClick}>
      ${params.header}
    </div>
    <div class="content">
      ${params.content}
    </div>`;

  if (params.popout) {
    params.popout = {};

    //used for keeping track of where the content came from.
    params.originalTarget = params.drawer.querySelector('.content');

    params.popoutBtn = params.drawer.querySelector('[data-id=popout-btn]');
    params.popoutBtn ??= mapp.utils.html
      .node`<button data-id="popout-btn" class="notranslate material-symbols-outlined">
                    open_in_new
                  </button>`;

    // Used to position the popout button in the header.
    const beforeElement =
      params.drawer
        .querySelector('.header')
        .querySelector('[data-id="display-toggle"]') ||
      params.drawer.querySelector('.header').querySelector('.caret');

    //Add the popoutBtn to the drawer header.
    params.drawer
      .querySelector('.header')
      .insertBefore(params.popoutBtn, beforeElement);

    params.popoutBtn.onclick = () => {
      //Hide the original drawer the popout came from.
      params.drawer.style.display = 'none';

      popoutDialog(params);

      //If view is provided, check whether there is anything else in the view.
      if (params.view) {
        params.viewChildren = Array.from(
          params.view.querySelector('.content')?.children || [],
        ).filter((el) => el.checkVisibility());
      }

      //Hide the caret and close the drawer if theres nothing else in the layer-view
      if (params.viewChildren) {
        !params.viewChildren.length &&
          params.view
            .querySelector('.header')
            .dispatchEvent(new Event('click'));

        !params.viewChildren.length &&
          params.view
            .querySelector('.caret')
            .style.setProperty('display', 'none');
      }
    };
  }

  return params.drawer;

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

/**
@function popoutDialog

@description
the popoutDialog creates the popout element for a drawer and appends the popout button to the header of the drawer.

@param {Object} params The configuration params for the popout element.
@property {string} params.data_id The data-id for popout element.
@property {HTML} params.header The header element[s].
@property {HTML} params.content The content element[s] for the popout.
@property {HTML} params.drawer The drawer element being popped out.
@property {HTML} params.originalTarget The element that holds the content within the drawer being popped out.
*/
function popoutDialog(params) {
  if (params.popout?.dialog) {
    //Reappend the content and header
    params.popout.node
      .querySelector('.content')
      .appendChild(
        mapp.utils.html
          .node`${Array.from(params.drawer.querySelector('.content').children)}`,
      );

    //The dialog closebtn is not part of params.header
    //Add it to the header when the dialog is shown
    params.popout.node
      .querySelector('.headerDrag')
      .replaceChildren(
        mapp.utils.html
          .node`${params.header}${params.popout.minimizeBtn}${params.popout.closeBtn}`,
      );
    return params.popout.show();
  }

  Object.assign(params.popout, {
    header: params.header,
    data_id: `${params.data_id}-popout`,
    target: document.getElementById('Map'),
    content: Array.from(params.drawer.querySelector('.content').children),
    height: 'auto',
    left: '5%',
    top: '0.5em',
    class: 'box-shadow popout',
    css_style: 'width: 300px; height 300px',
    containedCentre: true,
    contained: true,
    headerDrag: true,
    closeBtn: true,
    minimizeBtn: true,
    onClose: () => {
      //Hide the drawer being poppped out

      //Show the caret and open the drawer
      if (params.viewChildren) {
        !params.viewChildren.length &&
          params.view
            .querySelector('.header')
            .dispatchEvent(new Event('click'));
        !params.viewChildren.length &&
          params.view.querySelector('.caret').style.removeProperty('display');
      }
      params.drawer.style.removeProperty('display');

      //Reappend the header and the content
      params.drawer
        .querySelector('.header')
        .replaceChildren(mapp.utils.html.node`${params.header}`);

      params.originalTarget.appendChild(
        mapp.utils.html
          .node`${Array.from(params.popout.node.querySelector('.content').children)}`,
      );

      //The toggle button is not in the params.header.
      //Reappend it when closng the dialog ahead of the toggle or caret.
      const beforeElement =
        params.drawer
          .querySelector('.header')
          .querySelector('[data-id="display-toggle"]') ||
        params.drawer.querySelector('.header').querySelector('.caret');

      params.drawer
        .querySelector('.header')
        .insertBefore(params.popoutBtn, beforeElement);
    },
  });

  mapp.ui.elements.dialog(params.popout);

  params.popout.view = params.popout.node.querySelector('.content');
}
