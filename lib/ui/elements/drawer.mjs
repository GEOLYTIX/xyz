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
@property {boolean} [params.drawer] Optional flag to skip creation of the expandable container and/or header. Set to `false` creates header and content. Set to `null` creates content only.
@property {HTMLElement} [params.view] The layer view the drawer is in.
@returns {HTMLElement} The drawer element.
*/

export default function drawer(params) {
  params.data_id ??= 'drawer';

  if (params.drawer === false) {
    // card with header
    params.drawer = mapp.utils.html.node`<div 
      class="${'drawer ' + (params.class || '')}"
      data-id=${params.data_id}>
      <div class="header">${params.header}</div>
      <div class="content">${params.content}`;

    return params.drawer;
  }

  if (params.drawer === null) {
    // card with no header
    params.drawer = mapp.utils.html.node`<div
    data-id=${params.data_id}
    class="${params.class || ''}">
    <div class="content">${params.content}`;

    return params.drawer;
  }

  params.class = `drawer expandable ${params.class || ''}`;

  params.drawer = mapp.utils.html.node`
  <div
    data-id=${params.data_id}
    class=${params.class}>
    <div
      class="header"
      onclick=${onClick}>
      ${params.header}
      <div class="notranslate material-symbols-outlined caret"></div>
    </div>
    <div class="content">
      ${params.content}
    </div>`;

  if (params.popout) {
    params.popout = {};

    //used for keeping track of where the content came from.
    params.originalTarget = params.drawer.querySelector('.content');

    params.popoutBtn = params.drawer
      .querySelector('.header')
      .querySelector('[data-id=popout-btn]');

    //Append the button if it is not present in the header already.
    if (!params.popoutBtn) {
      params.popoutBtn = mapp.utils.html.node`<button
      data-id="popout-btn"
      class="notranslate material-symbols-outlined">
      open_in_new`;

      //Identify the caret element.
      const beforeElement = params.drawer
        .querySelector('.header')
        .querySelector('.caret');

      //Add the popoutBtn to the drawer header.
      params.drawer
        .querySelector('.header')
        .insertBefore(params.popoutBtn, beforeElement);
    }

    params.popoutBtn.onclick = () => {
      //Hide the original drawer the popout came from.
      params.drawer.style.display = 'none';

      params.view = params.drawer.parentElement;
      popoutDialog(params);

      //If view is provided, check whether there is anything else in the view.
      if (params.view) {
        params.viewChildren = Array.from(params.view.children || []).filter(
          (el) => el.checkVisibility(),
        );
      }

      //Hide the caret and close the drawer if theres nothing else in the layer-view
      if (params.viewChildren && !params.viewChildren.length) {
        params.view.previousElementSibling.dispatchEvent(new Event('click'));
        params.view.parentElement.classList.add('empty');

        params.view.previousElementSibling
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
      .querySelector('header')
      .replaceChildren(
        mapp.utils.html
          .node`${Array.from(params.drawer.querySelector('.header').children)}${params.popout.minimizeBtn}${params.popout.closeBtn}`,
      );
    return params.popout.show();
  }

  Object.assign(params.popout, {
    data_id: `${params.data_id}-popout`,
    target: document.getElementById('Map'),
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
      if (params.viewChildren && !params.viewChildren.length) {
        params.view.parentElement.classList.remove('empty');
        params.view.previousElementSibling.dispatchEvent(new Event('click'));

        params.view.previousElementSibling
          .querySelector('.caret')
          .style.removeProperty('display');
      }
      params.drawer.style.removeProperty('display');

      //Reappend the header and the content, without the minimizeBtn and closeBtn
      params.drawer
        .querySelector('.header')
        .replaceChildren(
          mapp.utils.html
            .node`${Array.from(params.popout.node.querySelector('header').children).filter((el) => !['close', 'minimize'].includes(el.dataset.id))}`,
        );

      params.originalTarget.appendChild(
        mapp.utils.html
          .node`${Array.from(params.popout.node.querySelector('.content').children)}`,
      );
    },
  });

  mapp.ui.elements.dialog(params.popout);

  //Replace the children of the header and content elements
  params.popout.node
    .querySelector('header')
    .replaceChildren(
      mapp.utils.html
        .node`${Array.from(params.drawer.querySelector('.header').children)}${params.popout.minimizeBtn}${params.popout.closeBtn}`,
    );

  params.popout.node
    .querySelector('.content')
    .appendChild(
      mapp.utils.html
        .node`${Array.from(params.drawer.querySelector('.content').children)}`,
    );

  params.popout.view = params.popout.node.querySelector('.content');
}
