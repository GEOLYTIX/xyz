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

  drawDialog(layer);

  if (layer.draw.drawer === false) {
    layer.draw.view =
      layer.draw.dialog?.btn ||
      mapp.utils.html.node`<div data-id="draw-drawer">
        <h3>${mapp.dictionary.layer_add_new_location}</h3>
        ${layer.draw.content}`;
  } else {
    layer.draw.view = mapp.ui.elements.drawer({
      data_id: `draw-drawer`,
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

/**
@function drawDialog

@description
This method has been copied from panels/filter.mjs module. A shared method should be created to be available for other drawer panels without excessive duplicate code.
*/
function drawDialog(layer) {
  if (!layer.draw.dialog) return;

  if (layer.draw.dialog === true) layer.draw.dialog = {};

  layer.draw.drawer = false;

  layer.draw.dialog.btn_title ??= 'Open the draw dialog';
  layer.draw.dialog.btn_label ??= 'Add new Location';

  layer.draw.dialog.btn = mapp.utils.html.node`<button 
    class="wide flat action multi_hover"
    data-id=${`multifilter-${layer.key}`}
    title=${layer.draw.dialog.btn_title}
    onclick=${(e) => {
      // classList.toggle resolves as true when the class is added.
      if (layer.draw.dialog?.btn.classList.toggle('active')) {
        openDialog(layer);
      } else {
        // The decorated dialog object has a close method.
        layer.draw.dialog.close();
      }
    }}>
    <span class="material-symbols-outlined notranslate">new_label</span>
    ${layer.draw.dialog.btn_label}`;

  //Hide the dialog when the layer is hidden
  layer.hideCallbacks.push(() => {
    layer.draw.dialog?.btn.classList.contains('active') &&
      layer.draw.dialog?.btn.dispatchEvent(new Event('click'));
    return layer;
  });
}

/**
@function openDialog
@description
Open the layer.draw.dialog.
*/
function openDialog(layer) {
  layer.show();

  if (layer.draw.dialog.show) return layer.draw.dialog.show();

  layer.draw.dialog.title ??= 'Add new Location';

  layer.draw.dialog.header = mapp.utils.html`
    <h1>${layer.draw.dialog.title}`;

  Object.assign(layer.draw.dialog, {
    data_id: `${layer.key}-draw-dialog`,
    target: document.getElementById('Map'),
    content: layer.draw.content,
    height: 'auto',
    left: '5em',
    top: '0.5em',
    class: 'box-shadow',
    css_style: 'min-width: 300px; width: 350px',
    containedCentre: true,
    contained: true,
    headerDrag: true,
    minimizeBtn: true,
    closeBtn: true,
    onClose: () => {
      // Toggle the active class on the button
      layer.draw.dialog.btn.classList.remove('active');
    },
  });

  mapp.ui.elements.dialog(layer.draw.dialog);
}
