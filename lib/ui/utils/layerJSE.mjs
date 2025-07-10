/**
## /ui/utils/layerJSE
The module exports a default method to create a JSONEditor for JSON layer operations.

@requires /ui/elements/jsoneditor

@module /ui/utils/layerJSE
*/

/**
@function layerJSE
@description
The method calls upon the jsoneditor element method to create a JSE instance with a custom render menu.

@param {HTMLElement} target The render target for the JSE element.
@param {object} content The JSE content
@param {object} btn A button to add to the menu in the renderMenu method.
*/
export default async function layerJSE(target, content, btn) {
  // Use the content as target for the jsoneditor control.
  const jsoneditor = await mapp.ui.elements.jsoneditor({
    props: {
      onRenderMenu: (items) => renderMenu(items, btn),
      content,
      mode: 'text',
    },
    target,
  });

  return jsoneditor;
}

/**
@function renderMenu
@description
The renderMenu method filters out most default menu elements and pushes a btn into the menu.
*/
function renderMenu(items, btn) {
  items.push(btn);

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
