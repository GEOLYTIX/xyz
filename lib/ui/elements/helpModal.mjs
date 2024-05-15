export default (params) => {

  // If a modal is already present, remove it
  const modal = document.querySelector('[data-id=modal_drawing]')

  modal && modal.remove()

  if (!params) return;

  params.target ??= document.getElementById('Map')

  // Create the modal
  mapp.ui.elements.modal({
    data_id: 'modal_drawing',
    header: params.header,
    target: params.target,
    content: params.content,
    height: 'auto',
    width: '200px',
    css_style: 'padding: 0.5em;',
    top: 30,
    left: 60,
    contained: true,
    close: true
  });
}