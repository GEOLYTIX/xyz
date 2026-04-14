/**
## /ui/locations/entries/json

The json layer entry module exports a default method to add a jsoneditor control to the location view.

@requires module:/ui/elements/jsoneditor

@module /ui/locations/entries/json
*/

/**
@function json

@description
The json location entry method creates a jsoneditor control with data from either the entry newValue or value.

@param {infoj-entry} entry type:json entry.

@return {HTMLElement} The entry node containing a jsoneditor control.
*/
export default function json(entry) {
  entry.css_val ??= '';

  // json entries cannot be inline as the jsoneditor formatting looks odd.
  // We cannot remove entry.inline here as it has already been applied in the infoj.mjs module, so just warn instead.
  if (entry.inline) {
    console.warn(
      `${entry.key} - json entries cannot be inline, please remove inline true from entry`,
    );
  }

  const node = mapp.utils.html.node`<div
    class="val"
    style=${entry.css_val}>`;

  entry.data = entry.newValue || entry.value;

  // Limit the menu for the jsoneditor control.
  function renderMenu(items) {
    return items
      .filter((item) => item.text !== 'tree')
      .filter((item) => item.text !== 'text')
      .filter((item) => item.text !== 'table')
      .filter((item) => item.type !== 'separator')
      .filter((item) => item.className !== 'jse-undo')
      .filter((item) => item.className !== 'jse-redo')
      .filter((item) => item.className !== 'jse-search')
      .filter((item) => item.className !== 'jse-contextmenu')
      .filter((item) => item.className !== 'jse-sort')
      .filter((item) => item.className !== 'jse-transform');
  }

  // Create a jsoneditor control with default props.
  // The control is readonly if the entry is not editable.
  entry.jsoneditor = mapp.ui.elements.jsoneditor({
    data: entry.data,
    props: {
      mode: 'text',
      onChange,
      onRenderMenu: renderMenu,
      readOnly: !entry.edit,
    },
    target: node,
  });

  // The onChange method will short circuit on contentErrors.
  function onChange(content, previousContent, changeStatus) {
    if (changeStatus.contentErrors) return;

    // Parse the jsoneditor [text] content as newValue.
    entry.newValue = JSON.parse(content.text);
    entry.location.view?.dispatchEvent(
      new CustomEvent('valChange', {
        detail: entry,
      }),
    );
  }

  return node;
}
