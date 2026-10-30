/**
## /ui/layers/panels/jsonEditor
The layer panels module exports a default method to open a dialog with a layerJSE element to update the mapp layer.

@requires /layer/decorate
@requires /ui/layers/view
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
@async

@description
The method extracts the content from the provided jsoneditor argument and attempts to decorate a new layer from the json content.

The view of the new layer is inserted before the view of the current layer, which may be in a listview group. The current layer is removed and the new layer is assigned with the key of the current layer to the mapview.layers.

@param {jse} jse A jsoneditor instance.
@param {layer} layer A decorated mapp layer.
@returns {Promise<layer>} The new decorated mapp layer.
*/
async function updateLayer(jse, layer) {
  // The jsoneditor content is json or text depending on the last edit mode.
  const content = jse.get();

  const jsonLayer = structuredClone(content.json) ?? JSON.parse(content.text);

  jsonLayer.mapview = layer.mapview;

  const newLayer = await mapp.layer.decorate(jsonLayer);

  if (!newLayer.L) {
    console.warn('Updated layer could not be decorated');
    return;
  }

  mapp.ui.layers.view(newLayer);

  // The layer.view may be in a listview group.
  newLayer.view && layer.view?.before(newLayer.view);

  layer.remove();

  newLayer.mapview.layers[layer.key] = newLayer;

  newLayer.display && newLayer.show();

  return newLayer;
}
