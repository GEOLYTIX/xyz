/**
## /plugins/userLayer

The plugin module provides developers a jsoneditor interface to add new layers in the default view.

@requires /ui/utils/layerJSE

@module /plugins/userLayer
*/

/**
@function userLayer
@async

@description
The userLayer plugin method adds a button to the layer control to open a jsoneditor dialog.

The jsoneditor dialog allows to validate a layer json configuration to add as user layer to the mapview.

@param {Object} plugin The object holds the plugin configuration.
@param {mapview} mapview The mapview to which a user layer should be added.
*/
export async function userLayer(plugin, mapview) {
  // The mapp.ui lib must be loaded.
  if (!mapp.ui?.utils.layerJSE) return;

  plugin.layersNode = document.getElementById('layers');

  if (!plugin.layersNode) return;

  // Create a content div for the dialog.
  const content = mapp.utils.html.node`<div>`;

  const addBtn = {
    className: 'text-button',
    onClick: () => addLayer(plugin, mapview),
    text: 'Add Layer',
    title: 'Add Layer to mapview',
    type: 'button',
  };

  // Use the content as target for the jsoneditor control.
  plugin.jsoneditor = await mapp.ui.utils.layerJSE(
    content,
    { json: {} },
    addBtn,
  );

  plugin.btn = mapp.utils.html.node`<button
    class="raised"
    onclick=${() => {
      plugin.btn.classList.toggle('active');

      plugin.dialog = mapp.ui.elements.dialog({
        header: mapp.utils.html.node`<div>`,
        css_style: 'width: 500px; height 300px',
        containedCentre: true,
        contained: true,
        closeBtn: true,
        onClose: () => {
          plugin.btn.classList.toggle('active');
        },
        content,
      });
    }}>Add Layer`;

  plugin.layersNode.append(plugin.btn);
}

/**
@function addLayer
@async

@description
The method will attempt to decorate the json content of the jsoneditor element as a mapp layer.

The decorate mapp layer will be added to the mapview and the layer view will be appended to the layers list.

@param {Object} plugin The object holds the plugin configuration.
@param {mapview} mapview The mapview to which a user layer should be added.
*/
async function addLayer(plugin, mapview) {
  const content = plugin.jsoneditor.get();

  const jsonLayer = JSON.parse(content.text);

  jsonLayer.mapview = mapview;

  jsonLayer.zIndex ??= mapview.zIndex++;

  jsonLayer.key ??= jsonLayer.zIndex;

  const newLayer = await mapp.layer.decorate(jsonLayer);

  if (!newLayer.L) {
    console.warn('JSON layer could not be decorated');
    return;
  }

  mapp.ui.layers.view(newLayer);

  plugin.layersNode.append(newLayer.view);

  newLayer.mapview.layers[newLayer.key] = newLayer;

  newLayer.display && newLayer.show();

  plugin.dialog.close();
}
