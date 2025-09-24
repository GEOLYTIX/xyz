/**
Dictionary entries:
- layer_add_new_location

@requires /dictionary

*/

/**
@function drawPanel

@description
The drawPanel method iterates over the layer.draw object and creates interface elements for each.

The interface elements are returned in a panel element.

Specifying `layer.draw.drawer: false` will prevent a drawer from being made for the drawing panel.

@param {layer} layer
@property {string} layer.geom The field to store draw geometries.
@property {Object} layer.draw The configuration for the layer draw methods.
@property {boolean} [draw.hidden] The draw panel should not be created for the layer.view.

@returns {HTMLElement} The draw panel drawer element.
*/
export default function drawPanel(layer) {
  if (typeof layer.draw !== 'object') return;

  // Do not create the panel.
  if (layer.draw.hidden) return;

  // If the layer has no geom return with a warning as you need a geom to draw.
  if (!layer.geom) {
    console.warn(
      `Layer: ${layer.key} - You must have a geom property to draw new features.`,
    );
    return;
  }

  const elements = Object.keys(layer.draw)
    .map((key) => {
      // Return element from drawing method.
      return mapp.ui.elements.drawing[key]?.(layer);
    })
    .filter((node) => !!node);

  // Short circuit panel creation without elements.
  if (!elements.length) return;

  const content = mapp.utils.html`${elements}`;

  if (layer.draw.drawer === false) {
    return mapp.utils
      .html`<div id="draw-drawer"><h3>${mapp.dictionary.layer_add_new_location}</h3>${content}`;
  }

  const drawer = mapp.ui.elements.drawer({
    data_id: `draw-drawer`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="notranslate material-symbols-outlined caret"/>`,
    content,
    popout: layer.draw.popout,
  });

  return drawer;
}
