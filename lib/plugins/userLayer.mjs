/**
## /plugins/userLayer

The developer plugin provides and interface to test the jsoneditor control and allows to test adding layer from json.

@module /plugins/userLayer

@requires module:/ui/elements/jsoneditor
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
  plugin.layersNode = document.getElementById('layers');

  if (!plugin.layersNode) return;

  // Create a content div for the dialog.
  const content = mapp.utils.html.node`<div>`;

  // Use the content as target for the jsoneditor control.
  plugin.jsoneditor = await mapp.ui.elements.jsoneditor({
    props: {
      onRenderMenu: renderMenu,
    },
    target: content,
  });

  // Create a custom menu for the userLayer jsoneditor control.
  function renderMenu(items) {
    // Push button to add layer to mapview layers.
    items.push({
      icon: {
        icon: [
          448,
          512,
          [128190, 128426, 'save'],
          'f0c7',
          'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z',
        ],
        iconName: 'floppy-disk',
        prefix: 'fas',
      },
      onClick: addLayer,
      title: 'Add Layer',
      type: 'button',
    });

    return items
      .filter((item) => item.text !== 'table')
      .filter((item) => item.type !== 'separator')
      .filter((item) => item.className !== 'jse-undo')
      .filter((item) => item.className !== 'jse-redo')
      .filter((item) => item.className !== 'jse-search')
      .filter((item) => item.className !== 'jse-contextmenu')
      .filter((item) => item.className !== 'jse-sort')
      .filter((item) => item.className !== 'jse-transform');
  }

  async function addLayer() {
    const content = plugin.jsoneditor.get();

    const jsonLayer = JSON.parse(content.text);

    const layers = await mapview.addLayer(jsonLayer);

    const layer = layers[0];

    mapp.ui.layers.view(layer);

    plugin.layersNode.append(layer.view);
  }

  const dialog = {
    closeBtn: true,
    content,
    header: 'Add Layer',
    target: document.getElementById('Map'),
  };

  plugin.btn = mapp.utils.html.node`<button
    class="raised"
    onclick=${() => {
      mapp.ui.elements.dialog(dialog);
    }}>Add Layer`;

  // Append the plugin btn to the btnColumn.
  plugin.layersNode.append(plugin.btn);
}
