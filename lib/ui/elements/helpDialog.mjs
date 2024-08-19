let helpDialog

export default (params) => {

  // Only one helpDialog.node can be shown at any one time.
  helpDialog?.node.remove()

  if (!params) return;

  helpDialog = {
    target: document.getElementById('Map'),
    height: 'auto',
    width: '200px',
    css_style: 'padding: 0.5em;',
    top: '30px',
    left: '60px',
    contained: true,
    close: true,
    ...params
  }

  // Create the helpDialog.node
  mapp.ui.elements.dialog(helpDialog);
}