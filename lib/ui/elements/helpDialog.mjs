let helpDialog;

export default (params) => {
  // Only one helpDialog.node can be shown at any one time.
  helpDialog?.node.remove();

  if (!params) return;

  helpDialog = {
    target: document.getElementById('Map'),
    height: 'auto',
    css_style: 'padding: 0.5em;',
    top: '3em',
    left: '6em',
    contained: true,
    closeBtn: true,
    minimizeBtn: true,
    headerDrag: true,
    ...params,
  };

  // Create the helpDialog.node
  mapp.ui.elements.dialog(helpDialog);
};
