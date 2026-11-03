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

Any existing helpDialog will be removed first.

The method will shortcircuit with the params argument being undefined.

The method will also shortciurcuit if the mapp.user object has the hideHelp flag.

@param {Object} params Config paramaters for the dialog.
@property {String|HTMLElement} params.header The header displayed on the dialog.
@property {String|HTMLElement} params.content The content of the dialog.
*/
export default function helpDialog(params) {
  // Only one helpDialog.node can be shown at any one time.
  help_dialog?.node.remove();

  if (!params) return;

  if (mapp.user?.hideHelp) return;

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
