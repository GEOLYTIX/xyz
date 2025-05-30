/**
### /ui/uitls/popoutDialog

The popoutDialog util creates a dialgo for popping out drawers. 

@module /ui/utils/popoutDialog
*/

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
export default function popoutDialog(params) {
  if (params.popout?.dialog) {
    //Reappend the content and header
    params.popout.node
      .querySelector('.content')
      .appendChild(mapp.utils.html.node`${params.content}`);

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
    content: params.content,
    height: 'auto',
    left: '5%',
    top: '0.5em',
    class: 'box-shadow popout',
    css_style: 'width: 300px; height 300px',
    containedCentre: true,
    headerDrag: true,
    closeBtn: true,
    minimizeBtn: true,
    onClose: () => {
      //Hide the drawer being poppped out
      params.drawer.style.removeProperty('display');

      //Reappend the header and the content
      params.drawer
        .querySelector('.header')
        .replaceChildren(mapp.utils.html.node`${params.header}`);

      params.originalTarget.appendChild(
        mapp.utils.html.node`${params.content}`,
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
}
