/**
### /ui/elements/helpDialog
 
The helpDialog module creates the help dialogs displayed during certain map interactions.

@module /ui/elements/helpDialog
*/

//Null instantiation of the help_dialog.
let help_dialog;

/**
@function helpDialog

A dialog that describes how certain map controls work.

@param {Object} params Config paramaters for the dialog.
@property {String|HTMLElement} params.header The header displayed on the dialog.
@property {String|HTMLElement} params.content The content of the dialog.
@property {boolean} params.hideHelp Whether or not the dialog is created/displayed.
*/
export default function helpDialog(params) {
  // Only one helpDialog.node can be shown at any one time.
  help_dialog?.node.remove();

  if (!params) return;

  help_dialog = {
    closeBtn: true,
    contained: true,
    css_style: 'padding: 0.5em;',
    headerDrag: true,
    height: 'auto',
    left: '6em',
    minimizeBtn: true,
    target: document.getElementById('Map'),
    top: '3em',
    ...params,
  };

  // Create the helpDialog.node
  mapp.ui.elements.dialog(help_dialog);
}
