export default async function layerJSON(layer) {
  // Create a content div for the dialog.
  const content = mapp.utils.html.node`<div>`;

  const jsonLayer = mapp.utils.jsonParser(layer);

  // Use the content as target for the jsoneditor control.
  layer.jsoneditor = await mapp.ui.elements.jsoneditor({
    props: {
      onRenderMenu: renderMenu,
      content: { json: jsonLayer },
    },
    target: content,
  });

  return content;

  // Create a custom menu for the userLayer jsoneditor control.
  function renderMenu(items) {
    // Push button to add layer to mapview layers.
    items.push({
      className: 'material-symbols-outlined-important',
      onClick: () => updateLayer(layer),
      text: 'frame_reload',
      title: 'Update Layer',
      type: 'button',
    });

    return items
      .filter((item) => item.text !== 'tree')
      .filter((item) => item.text !== 'table')
      .filter((item) => item.type !== 'separator')
      .filter((item) => item.className !== 'jse-undo')
      .filter((item) => item.className !== 'jse-redo')
      .filter((item) => item.className !== 'jse-search')
      .filter((item) => item.className !== 'jse-contextmenu')
      .filter((item) => item.className !== 'jse-sort')
      .filter((item) => item.className !== 'jse-transform');
  }

  async function updateLayer(layer) {
    const content = layer.jsoneditor.get();

    const jsonLayer = content.json;

    const layers = await layer.mapview.addLayer(jsonLayer);

    console.log(layers);

    const newLayer = layers[0];

    if (!newLayer.L) {
      console.warn('Layer could not be decorated');
      return;
    }

    layer.view.remove();

    mapp.ui.layers.view(newLayer);

    const layersnode = document.getElementById('layers');

    layersnode.append(newLayer.view);
  }
}
