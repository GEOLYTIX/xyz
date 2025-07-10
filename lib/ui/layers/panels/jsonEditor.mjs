/**
## /ui/layers/panels/jsonEditor
The layer panels module exports a default method to open a dialog with a layerJSE element to update the mapp layer.

@requires /ui/utils/layerJSE

@module /ui/layers/panels/jsonEditor
*/

/**
@function jsonEditor
@description
The jsonEditor method asigns a jsoneditor element to the decorated layer and a removeCallback method to close the dialog.

The button returned from the panel method will display a modal dialog with the jsoneditor element.

The 'Update Layer' button of the jsoneditor element will attempt to update the layer object with the json content of the editor.

@param {layer} layer A decorated mapp layer.

@return {HTMLElement} A button to toggle the jsoneditor dialog.
*/
export default function jsonEditor(layer) {
  if (layer.jsonEditor === true) {
    layer.jsonEditor = {};
  }

  const button = mapp.utils.html
    .node`<button class="wide flat" data-id="jsonEditor">JSON Editor</button>`;

  button.addEventListener('click', async () => {
    button.classList.toggle('active');

    const jsonLayer = mapp.utils.jsonParser(layer);

    const content = mapp.utils.html.node`<div>`;

    const updateBtn = {
      className: 'text-button',
      onClick: () => updateLayer(jse, layer),
      text: 'Update Layer',
      title: 'Update Layer',
      type: 'button',
    };

    const jse = await mapp.ui.utils.layerJSE(
      content,
      { json: jsonLayer },
      updateBtn,
    );

    layer.jsonEditor.dialog = mapp.ui.elements.dialog({
      header: mapp.utils.html.node`<div>`,
      css_style: 'width: 500px; height 300px;',
      containedCentre: true,
      contained: true,
      closeBtn: true,
      onClose: () => {
        button.classList.toggle('active');
      },
      content,
    });
  });

  layer.removeCallbacks.push((layer) => {
    layer.jsonEditor?.dialog?.close();
  });

  return button;
}

/**
@function updateLayer
@description
The method extracts the content from the provided jsoneditor argument and attempt to update the mapp with the json content.

@param {jse} jse A jsoneditor instance.
@param {layer} layer A decorated mapp layer.
*/
async function updateLayer(jse, layer) {
  const content = jse.get();

  const layerJSON = JSON.parse(content.text);

  await layer.update(layerJSON);
}
