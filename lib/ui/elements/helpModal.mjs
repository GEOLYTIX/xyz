let helpModal

export default (params) => {

  // Only one helpModal.node can be shown at any one time.
  helpModal?.node.remove()

  if (!params) return;

  helpModal = {
    target: document.getElementById('Map'),
    height: 'auto',
    width: '200px',
    css_style: 'padding: 0.5em;',
    top: 30,
    left: 60,
    contained: true,
    close: true,
    ...params
  }

  // Create the helpModal.node
  mapp.ui.elements.modal(helpModal);
}