export default function json_editor(layer) {

  if (layer.json_editor === true) {
    layer.json_editor = {}
  }

  const button = mapp.utils.html
    .node`<button class="wide flat" data-id="json_editor">JSON Editor</button>`;

  button.addEventListener('click', async () => {
    button.classList.toggle('active');
    const content = await mapp.ui.elements.layerJSON(layer);
    layer.json_editor.dialog = mapp.ui.elements.dialog({
      header: mapp.utils.html.node`<div>`,
      css_style: 'width: 500px; height 300px',
      containedCentre: true,
      contained: true,
      closeBtn: true,
      onClose: () => {
        button.classList.toggle('active');
      },
      content,
    });
  });

  return button;
}
