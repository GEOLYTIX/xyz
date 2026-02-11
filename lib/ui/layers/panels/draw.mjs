/**
## ui/layers/panels/draw

The draw panel module exports the draw method.

Dictionary entries:
- layer_add_new_location

@requires /dictionary
@module /ui/layers/panels/draw
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
@property {boolean} [draw.popout] Whether the drawer can be popped out into a dialog.
@property {string} [draw.classList] The string will be appended to the drawer element classlist.

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

  layer.draw.content = mapp.utils.html`${elements}`;

  if (layer.draw.dialog) {
    layer.draw.dialog = {
      ...layer.draw.dialog,
      btn_label: 'Open Drawing Dialog',
      title: 'Drawing',
      icon: 'new_label',
    };
  }

  layer.draw.data_id ??= `${layer.key}-draw-drawer`;

  // mapp.ui.utils.panelDialog({
  //   layer,
  //   key: 'draw',
  //   name: 'Draw',
  //   icon: layer.draw.dialog?.btnIcon || 'new_label',
  //   data_id: 'draw-drawer',
  // });

  if (layer.draw.drawer === false) {
    layer.draw.view =
      layer.draw.dialog?.btn ||
      mapp.utils.html.node`<div data-id="draw-drawer">
        <h3>${mapp.dictionary.layer_add_new_location}</h3>
        ${layer.draw.content}`;
  } else {
    layer.draw.view = mapp.ui.elements.drawer({
      data_id: layer.draw.data_id,
      dialog: layer.draw.dialog,
      layer,
      header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="notranslate material-symbols-outlined caret"/>`,
      content: layer.draw.content,
      class: layer.draw.classList,
      popout: layer.draw.popout,
    });
  }

  return layer.draw.view;
}
