/**
### /ui/elements/layerStyle

The module exports an object of methods to for the creation of layer style elements.

@requires /ui/layers

@module /ui/elements/layerStyle
*/

const methods = {
  panel,
  hover,
  hovers,
  label,
  labels,
  opacitySlider,
  theme,
  themes,
}

export default methods

/**
@function panel

@description
The panel() style element method creates an array of style.elements from all available style property keys if not implicit.

The elements array will be mapped to return a flat array of HTMLElements as content for the layer.style.view node.

The layer.style.view is returned for the style drawer shown in the default mapp view layer.view.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Array} [style.elements] Array of method keys to order elements in the layer.style.view.

@returns {HTMLElement} The layer.style.view element.
*/
function panel(layer) {

  if (!layer.style) return;

  layer.style.elements ??= Object.keys(layer.style)

  // The layer.style.elements define which elements should be added in which order to the layer.style.view element.
  const content = layer.style.elements
    .filter(key => Object.hasOwn(layer.style, key))
    .filter(key => Object.hasOwn(methods, key))
    .map(key => methods[key](layer))
    .flat()
    .filter(element => !!element)

  if (!content.length) return;

  layer.style.view = mapp.utils.html.node`<div>${content}`

  return layer.style.view
}

/**
@function hover

@description
The hover() style element method will return a checkbox to toggle the display of the current hover.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} style.hover The current hover.
@property {Boolean} hover.hidden Whether a checkbox should be returned.
@property {Boolean} hover.display The state of the hover.

@returns {HTMLElement} A checkbox element to toggle the current hover.
*/
function hover(layer) {

  if (!layer.style.hover) return;

  if (layer.style.hover.hidden) return;

  return mapp.ui.elements.chkbox({
    data_id: 'hoverCheckbox',
    label: layer.style.hovers && mapp.dictionary.layer_style_display_hover
      || layer.style.hover.title || mapp.dictionary.layer_style_display_hover,
    checked: !!layer.style.hover.display,
    onchange: (checked) => {
      layer.style.hover.display = checked
    }
  })
}

/**
@function hovers

@description
The hovers() style element method will return a dropdown to change the current hover assigned to a layer.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} style.hover The current hover.
@property {Object} style.hovers Object where each property represents a hover configuration.

@returns {HTMLElement} A dropdown element to switch the current hover.
*/
function hovers(layer) {

  if (!layer.style.hover) return;

  if (layer.style.hover.hidden) return;

  if (!layer.style.hovers) return;

  // It takes two 2 tango!
  if (Object.keys(layer.style.hovers).length < 2) return;

  const entries = Object.keys(layer.style.hovers)

    // Check if that label is set to be hidden. 
    .filter(key => !layer.style.hovers[key].hidden)
    .map(key => ({
      title: layer.style.hovers[key].title || key,
      option: key
    }))

  return mapp.ui.elements.dropdown({
    placeholder: layer.style.hover.title,
    entries,
    callback: (e, entry) => {

      const display = layer.style.hover.display

      // Set hover from dropdown option.
      layer.style.hover = layer.style.hovers[entry.option]

      // Assign default featureHover method if non is provided.
      layer.style.hover.method ??= mapp.layer.featureHover;

      layer.style.hover.display = display
    }
  })
}

/**
@function label

@description
The label() style element method will return a checkbox to toggle the display of the current label.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} style.label The current label.
@property {Boolean} label.hidden Whether a checkbox should be returned.
@property {Boolean} label.display The state of the label.

@returns {HTMLElement} A checkbox element to toggle the current label.
*/
function label(layer) {

  if (!layer.style.label) return;

  if (layer.style.label.hidden) return;

  layer.style.labelCheckbox = mapp.ui.elements.chkbox({
    data_id: 'labelCheckbox',
    label: layer.style.labels && mapp.dictionary.layer_style_display_labels
      || layer.style.label.title || mapp.dictionary.layer_style_display_labels,
    checked: !!layer.style.label.display,
    onchange: (checked) => {
      layer.style.label.display = checked
      layer.reload()
    }
  })

  // This event must only be added once per layer.
  if (!layer.style.labelChangeEnd) {

    layer.style.labelChangeEnd = () => {

      const z = layer.mapview.Map.getView().getZoom();

      if (z <= layer.style.label.minZoom) {
        layer.style.labelCheckbox?.classList.add('disabled');

      } else if (z >= layer.style.label.maxZoom) {
        layer.style.labelCheckbox?.classList.add('disabled');

      } else {
        layer.style.labelCheckbox?.classList.remove('disabled');
      }
    }

    // Add zoom level check for label display.
    layer.mapview.Map.getTargetElement().addEventListener('changeEnd', layer.style.labelChangeEnd)
  }

  return layer.style.labelCheckbox
}

/**
@function labels

@description
The labels() style element method will return a dropdown to change the current label assigned to a layer.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} style.label The current label.
@property {Object} style.labels Object where each property represents a label configuration.

@returns {HTMLElement} A dropdown element to switch the current label.
*/
function labels(layer) {

  if (!layer.style.label) return;

  if (layer.style.label.hidden) return;

  if (!layer.style.labels) return;

  // It takes two 2 tango!
  if (Object.keys(layer.style.labels).length < 2) return;

  const entries = Object.keys(layer.style.labels)
    .filter(key => !layer.style.labels[key].hidden)
    .map(key => ({
      title: layer.style.labels[key].title || key,
      option: key
    }))

  function callback(e, entry) {

    const display = layer.style.label.display

    // Set label from dropdown option.
    layer.style.label = layer.style.labels[entry.option]

    layer.style.label.display = display

    layer.reload()
  }

  return mapp.ui.elements.dropdown({
    placeholder: layer.style.label.title,
    entries,
    callback
  })
}

function opacitySlider(layer) {

  return mapp.ui.elements.slider({
    label: `${mapp.dictionary.layer_style_opacity}`,
    min: 0,
    max: 100,
    val: parseInt(layer.L.getOpacity() * 100),
    callback: e => {
      layer.L.setOpacity(parseFloat(e / 100))
    }
  })
}

/**
@function theme

@description
The theme() style element method will returns a content array with elements for the theme meta text and legend.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} [style.labels] Available label configurations.
@property {Object} [style.hovers] Availabel hover configurations.
@property {Object} style.theme The current theme.
@property {string} [theme.title] Theme title for legend.
@property {string} [theme.meta] Meta text to display.
@property {string} [theme.setLabel] Key for label from style.labels{} to assign.
@property {string} [theme.setHover] Key for hover from style.hovers{} to assign.

@returns {Array} A content array for the theme meta and legend.
*/
function theme(layer) {

  if (!layer.style.theme) return;

  // Handle setLabel and labels in layer style.
  if (layer.style.theme?.setLabel && layer.style.labels) {
    layer.style.label = layer.style.labels[layer.style.theme.setLabel];
  }

  // Handle setHover and hovers in layer style.
  if (layer.style.theme?.setHover && layer.style.hovers) {
    layer.style.hover = layer.style.hovers[layer.style.theme.setHover];
  }

  const content = []

  if (layer.style.theme?.meta) {
    content.push(mapp.utils.html`<p>${layer.style.theme.meta}`)
  }

  if (Object.hasOwn(mapp.ui.layers.legends, layer.style.theme?.type)) {

    mapp.ui.layers.legends[layer.style.theme.type](layer)

    layer.style.legend && content.push(layer.style.legend)
  }

  return content;
}

/**
@function themes

@description
The themes() style element method will return a dropdown to change the current theme assigned to a layer.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} style.theme The current theme.
@property {Object} style.themes Object where each property represents a theme.
@property {Object} [style.label] The current label.
@property {Object} [style.hover] The current hover.

@returns {HTMLElement} A dropdown element to switch the current theme.
*/
function themes(layer) {

  if (!layer.style.themes) return;

  // It takes two 2 tango!
  if (Object.keys(layer.style.themes).length < 2) return;

  const entries = Object.keys(layer.style.themes).map(key => ({
    title: layer.style.themes[key].title || key,
    option: key
  }))

  function callback(e, entry) {

    // Set theme from dropdown option.
    layer.style.theme = layer.style.themes[entry.option]

    if (layer.style.theme.setLabel && layer.style.labels) {

      layer.style.label = layer.style.labels[layer.style.theme.setLabel]
    }

    if (layer.style.theme.setHover && layer.style.hovers) {

      layer.style.hover = layer.style.hovers[layer.style.theme.setHover]

      // Assign default featureHover method if non is provided.
      layer.style.hover.method ??= mapp.layer.featureHover;
    }

    const stylePanel = mapp.ui.layers.panels.style(layer)

    // Replace the children of the style panel.
    layer.view.querySelector('[data-id=style-drawer]')
      .replaceChildren(...stylePanel.children)

    layer.reload()
  }

  const dropdown = mapp.utils.html`
    <div>
      ${mapp.dictionary.layer_style_select_theme}
    </div>
    ${mapp.ui.elements.dropdown({
    placeholder: layer.style.theme.title,
    entries,
    callback
  })}`

  return dropdown
}
