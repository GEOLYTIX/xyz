/**
## /ui/elements/layerJSE
The module exports a default method to create a JSONEditor for a decorated mapp layer.

@requires /ui/elements/jsoneditor
@requires /utils/jsonParser

@module /ui/elements/layerJSE
*/

/**
@function layerJSE
@description
The method parses the layer JSON from a decorated mapp layer and passes the JSON as content to a jsoneditor element.

The jsoneditor toolbar features an update button which will call the layer.update method with the current json content.

@param {layer} layer A decorated mapp layer.
*/
export default async function layerJSE(layer) {
  // Create a content div for the dialog.
  const target = mapp.utils.html.node`<div>`;

  const jsonLayer = mapp.utils.jsonParser(layer);

  // Use the content as target for the jsoneditor control.
  layer.jsoneditor = await mapp.ui.elements.jsoneditor({
    props: {
      onRenderMenu: renderMenu,
      content: { json: jsonLayer },
      mode: 'text',
    },
    target,
  });

  return target;

  function renderMenu(items) {
    items.push({
      className: 'text-button',
      onClick: () => updateLayer(layer),
      text: 'Update Layer',
      title: 'Update Layer',
      type: 'button',
    });

    return items
      .filter((item) => item.text !== 'text')
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
}

async function updateLayer(layer) {
  const content = layer.jsoneditor.get();

  const layerJSON = JSON.parse(content.text);

  await layer.update(layerJSON);
}
