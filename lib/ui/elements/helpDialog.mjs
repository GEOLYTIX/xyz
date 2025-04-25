let helpDialog;

export default (params) => {
  // Only one helpDialog.node can be shown at any one time.
  helpDialog?.node.remove();

  if (!params) return;

  helpDialog = {
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
  mapp.ui.elements.dialog(helpDialog);
};
