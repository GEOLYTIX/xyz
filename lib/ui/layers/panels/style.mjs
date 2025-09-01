/**
### /ui/layers/panels/style

The style panel module exports the styleDrawer method for the `mapp.ui.layers.panels{}` library object.

Dictionary entries:
- layer_style_header

@requires /dictionary 

@requires /ui/elements/style
@requires /ui/elements/drawer

@module /ui/layers/panels/style
*/

/**
@function stylePanel

@description
The stylePanel will shortcircuit with the layer.style.hidden flag.

A layer style panel element will be requested from mapp.utils.style.panel().

A default order for the elements that make up the style panel will be assigned as mapp.ui.elements.style.elements[] if not implicit in configuration.

A drawer element will be created with the style panel element as content.

A default array will be assigned to the layer.style object to order the elements being added to the view in the [elements.layerStyle panel method]{@link module:/ui/elements/layerStyle~panel}.

Specifying `layer.style.drawer: false` will prevent a drawer from being made for the style panel.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Boolean} style.hidden Do not create style drawer for layer.view.
@property {string} style.classList String of additional classes to add to the drawer element.
@property {array} [style.elements=['labels','label','hovers','hover','themes','theme', 'icon_scaling','opacitySlider']] Array of default elements and their order for the style panel.

@returns {HTMLElement} The style drawer element for the layer.view.
*/
export default function stylePanel(layer) {
  // Do not create the panel.
  if (layer.style.hidden) return;

  layer.style.elements ??= [
    'labels',
    'label',
    'hovers',
    'hover',
    'themes',
    'theme',
    'icon_scaling',
    'opacitySlider',
  ];

  // Request style.panel element as content for drawer.
  const content = mapp.ui.elements.layerStyle.panel(layer);

  if (!content) return;

  layer.style.classList ??= '';

  // Create header for layer.view style drawer.
  const header = mapp.utils.html`
    <h3>${mapp.dictionary.layer_style_header}</h3>
    <div class="notranslate material-symbols-outlined caret"/>`;

  if (layer.style.drawer === false) {
    layer.style.drawer = mapp.utils.html
      .node`<div data-id="style-drawer"><h3>${mapp.dictionary.layer_style_header}</h3>${content}`;
  } else {
    // Create style drawer for layer.view
    layer.style.drawer = mapp.ui.elements.drawer({
      data_id: `style-drawer`,
      class: `raised ${layer.style.classList}`,
      header,
      content,
      popout: layer.style.popout,
    });
  }

  return layer.style.drawer;
}
