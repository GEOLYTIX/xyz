/**
### /ui/elements/layerStyle

The module exports an object of methods to for the creation of layer style elements.

Dictionary entries:
- layer_style_display_hover
- layer_style_display_labels
- layer_style_opacity
- layer_style_select_theme
- icon_scaling_field
- icon_scaling_label
- icon_scaling_cluster
- icon_scaling_zoom_in
- icon_scaling_zoom_out


@requires /dictionary 

@requires /ui/layers

@module /ui/elements/layerStyle
*/

const methods = {
  hover,
  hovers,
  icon_scaling,
  label,
  labels,
  opacitySlider,
  panel,
  theme,
  themes,
};

export default methods;

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

  layer.style.elements ??= Object.keys(layer.style);

  // The layer.style.elements define which elements should be added in which order to the layer.style.view element.
  const content = layer.style.elements
    .filter((key) => Object.hasOwn(layer.style, key))
    .filter((key) => Object.hasOwn(methods, key))
    .map((key) => methods[key](layer))
    .flat()
    .filter((element) => !!element);

  if (!content.length) return;

  layer.style.view = mapp.utils.html.node`<div>${content}`;

  return layer.style.view;
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
    checked: !!layer.style.hover.display,
    data_id: 'hoverCheckbox',
    label:
      (layer.style.hovers && mapp.dictionary.layer_style_display_hover) ||
      layer.style.hover.title ||
      mapp.dictionary.layer_style_display_hover,
    onchange: (checked) => {
      layer.style.hover.display = checked;
    },
  });
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
    .filter((key) => !layer.style.hovers[key].hidden)
    .map((key) => ({
      option: key,
      title: layer.style.hovers[key].title || key,
    }));

  return mapp.ui.elements.dropdown({
    callback: (e, entry) => {
      const display = layer.style.hover.display;

      // Set hover from dropdown option.
      layer.style.hover = layer.style.hovers[entry.option];

      // Assign default featureHover method if non is provided.
      layer.style.hover.method ??= mapp.layer.featureHover;

      layer.style.hover.display = display;
    },
    data_id: 'hoversDropdown',
    entries,
    placeholder: layer.style.hover.title,
  });
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
    checked: !!layer.style.label.display,
    data_id: 'labelCheckbox',
    label:
      (layer.style.labels && mapp.dictionary.layer_style_display_labels) ||
      layer.style.label.title ||
      mapp.dictionary.layer_style_display_labels,
    onchange: (checked) => {
      layer.style.label.display = checked;
      layer.reload();
    },
  });

  // This event must only be added once per layer.
  if (!layer.style.labelChangeEnd) {
    // The labelChangeEnd method disables the labelCheckbox when the style.label is out of range.
    layer.style.labelChangeEnd = () => {
      const z = layer.mapview.Map.getView().getZoom();

      if (z <= layer.style.label.minZoom) {
        layer.style.labelCheckbox?.classList.add('disabled');
      } else if (z >= layer.style.label.maxZoom) {
        layer.style.labelCheckbox?.classList.add('disabled');
      } else {
        layer.style.labelCheckbox?.classList.remove('disabled');
      }
    };

    // Add zoom level check for label display.
    layer.mapview.Map.getTargetElement().addEventListener(
      'changeEnd',
      layer.style.labelChangeEnd,
    );
  }

  return layer.style.labelCheckbox;
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
    .filter((key) => !layer.style.labels[key].hidden)
    .map((key) => ({
      option: key,
      title: layer.style.labels[key].title || key,
    }));

  function callback(e, entry) {
    const display = layer.style.label.display;

    // Set label from dropdown option.
    layer.style.label = layer.style.labels[entry.option];

    layer.style.label.display = display;

    layer.reload();
  }

  return mapp.ui.elements.dropdown({
    callback,
    data_id: 'labelsDropdown',
    entries,
    placeholder: layer.style.label.title,
  });
}

function opacitySlider(layer) {
  return mapp.ui.elements.slider({
    callback: (e) => {
      layer.L.setOpacity(parseFloat(e / 100));
    },
    data_id: 'opacitySlider',
    label: `${mapp.dictionary.layer_style_opacity}`,
    max: 100,
    min: 0,
    val: parseInt(layer.L.getOpacity() * 100),
  });
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

@returns {HTMLElement} <div> with contents array for the theme meta and legend.
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

  const content = [];

  if (layer.style.theme?.meta) {
    content.push(mapp.utils.html`<p>${layer.style.theme.meta}`);
  }

  if (Object.hasOwn(mapp.ui.layers.legends, layer.style.theme?.type)) {
    mapp.ui.layers.legends[layer.style.theme.type](layer);

    layer.style.legend && content.push(layer.style.legend);
  }

  return mapp.utils.html.node`<div data-id="layerTheme">${content}`;
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

  const entries = Object.keys(layer.style.themes).map((key) => ({
    option: key,
    title: layer.style.themes[key].title || key,
  }));

  function callback(e, entry) {
    // Set theme from dropdown option.
    layer.style.theme = layer.style.themes[entry.option];

    if (layer.style.theme.setLabel && layer.style.labels) {
      layer.style.label = layer.style.labels[layer.style.theme.setLabel];
    }

    if (layer.style.theme.setHover && layer.style.hovers) {
      layer.style.hover = layer.style.hovers[layer.style.theme.setHover];

      // Assign default featureHover method if non is provided.
      layer.style.hover.method ??= mapp.layer.featureHover;
    }

    const stylePanel = mapp.ui.layers.panels.style(layer);

    if (layer.style.panel) {
      // Replace children in location layer entry style.panel
      layer.style.panel.replaceChildren(...stylePanel.children);
    }

    // Replace the children of the style panel.
    layer.view
      ?.querySelector('[data-id=style-drawer]')
      .replaceChildren(...stylePanel.children);

    layer.reload();
  }

  const dropdown = mapp.utils.html`<div>
    ${mapp.dictionary.layer_style_select_theme}
    ${mapp.ui.elements.dropdown({
      callback,
      data_id: 'themesDropdown',
      entries,
      placeholder: layer.style.theme.title,
    })}`;

  return dropdown;
}

/**
@function icon_scaling

@description
The icon_scaling() style element method will returns a contents array with controls for icon.scaling properties (field, icon, clusterScale, zoomInScale, and zoomOutScale).

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Object} style.icon_scaling The icon_scaling config.
@property {Boolean} icon_scaling.hidden Do not show icon_scaling controls in panel.
@property {String} [icon_scaling.field] Assign field value as feature property for scaling point feature icons.
@property {Object} [icon_scaling.fields] An Object of objects with fields that can be assigned the feature property for scaling.
@property {Boolean} [icon_scaling.icon] Add control to alter the base icon scale.
@property {Boolean} [icon_scaling.clusterScale] Add control to alter the cluster.clusterScale value.
@property {Boolean} [icon_scaling.zoomInScale] Add control to alter the zoomInScale value.
@property {Boolean} [icon_scaling.zoomOutScale] Add control to alter the zoomOutScale value.

@returns {HTMLElement} <div> with contents array of HTMLElements to control icon scaling.
*/
function icon_scaling(layer) {
  if (!layer.style.icon_scaling) return;

  if (layer.style.icon_scaling.hidden) return;

  const content = [];

  if (layer.style.icon_scaling.fields) {
    const entries = Object.keys(layer.style.icon_scaling.fields).map((key) => ({
      option: layer.style.icon_scaling.fields[key].field,
      title: layer.style.icon_scaling.fields[key].title || key,
      key: key,
    }));

    //Push an entry with no option so scaling can be disabled
    entries.push({ title: mapp.dictionary.icon_scaling_no_scaling });

    layer.style.icon_scaling.placeholder ??=
      mapp.dictionary.icon_scaling_select_one;

    layer.style.icon_scaling.title ??= mapp.dictionary.icon_scaling_title;

    const placeholder =
      Object.keys(layer.style.icon_scaling.fields).find(
        (key) =>
          layer.style.icon_scaling.fields[key].field ===
          layer.style.icon_scaling.field,
      ) || Object.keys(layer.style.icon_scaling.fields)[0];

    content.push(
      mapp.utils.html`
        <h3>${layer.style.icon_scaling.title}`,
      mapp.ui.elements.dropdown({
        data_id: 'iconScalingFieldsDropdown',
        entries: entries,
        callback: (e, options) => {
          if (options.option) {
            Object.assign(layer.style.icon_scaling, {
              ...layer.style.icon_scaling.fields[options.key],
            });
          } else {
            delete layer.style.icon_scaling.field;
          }

          //Reload layer to re-run featureStyle
          layer.reload();

          layer.L.changed();
        },
        placeholder:
          layer.style.icon_scaling.fields[placeholder].title ||
          placeholder ||
          layer.style.icon_scaling.placeholder,
      }),
    );
  } else if (layer.style.icon_scaling.field) {
    content.push(
      mapp.ui.elements.chkbox({
        checked: !!layer.style.icon_scaling.field,
        data_id: 'iconScalingFieldCheckbox',
        label: mapp.dictionary.icon_scaling_field,
        onchange: (checked) => {
          if (checked) {
            layer.style.icon_scaling.field = layer.style.icon_scaling._field;
            delete layer.style.icon_scaling._field;
          } else {
            layer.style.icon_scaling._field = layer.style.icon_scaling.field;
            delete layer.style.icon_scaling.field;
          }

          layer.L.changed();
        },
      }),
    );
  }

  if (layer.style.icon_scaling.icon) {
    layer.style.default.scale ??= 1;

    layer.style.icon_scaling.maxScale ??= layer.style.default.scale * 3;

    layer.style.icon_scaling.minScale ??= 0.1;

    layer.style.icon_scaling.icon_scaling_label ??=
      mapp.dictionary.icon_scaling_label;

    content.push(
      mapp.ui.elements.slider({
        callback: (val) => {
          layer.style.default.scale = parseFloat(val);
          clearTimeout(layer.style.timeout);
          layer.style.timeout = setTimeout(() => layer.L.changed(), 400);
        },
        data_id: 'iconScalingSlider',
        label: layer.style.icon_scaling.icon_scaling_label,
        max: layer.style.icon_scaling.maxScale,
        min: layer.style.icon_scaling.minScale,
        step: layer.style.default.scale / 10,
        val: layer.style.default.scale,
      }),
    );
  }

  if (
    layer.style.icon_scaling.clusterScale &&
    layer.style.cluster?.clusterScale
  ) {
    layer.style.cluster.clusterScale ??= 1;

    content.push(
      mapp.ui.elements.slider({
        callback: (val) => {
          layer.style.cluster.clusterScale = parseFloat(val);
          clearTimeout(layer.style.timeout);
          layer.style.timeout = setTimeout(() => layer.L.changed(), 400);
        },
        data_id: 'iconScalingClusterSlider',
        label: mapp.dictionary.icon_scaling_cluster,
        max: layer.style.cluster.clusterScale * 3,
        min: 0,
        step: layer.style.cluster.clusterScale / 10,
        val: layer.style.cluster.clusterScale,
      }),
    );
  }

  // Only add this elements if icon_scaling.zoomInScale is defined.
  if (layer.style.icon_scaling.zoomInScale) {
    // Assign zoomInScale as 1 if not implicit.
    layer.style.zoomInScale ??= 1;

    content.push(
      mapp.ui.elements.slider({
        callback: (val) => {
          layer.style.zoomInScale = parseFloat(val);
          clearTimeout(layer.style.timeout);
          layer.style.timeout = setTimeout(() => layer.L.changed(), 400);
        },
        data_id: 'iconScalingZoomInSlider',
        label: mapp.dictionary.icon_scaling_zoom_in,
        max: layer.style.zoomInScale * 3,
        min: 0,
        step: layer.style.zoomInScale / 10,
        val: layer.style.zoomInScale,
      }),
    );
  }

  // Only add this elements if icon_scaling.zoomOutScale is defined.
  if (layer.style.icon_scaling.zoomOutScale) {
    // Assign zoomOutScale as 1 if not implicit.
    layer.style.zoomOutScale ??= 1;

    content.push(
      mapp.ui.elements.slider({
        callback: (val) => {
          layer.style.zoomOutScale = parseFloat(val);
          clearTimeout(layer.style.timeout);
          layer.style.timeout = setTimeout(() => layer.L.changed(), 400);
        },
        data_id: 'iconScalingZoomOutSlider',
        label: mapp.dictionary.icon_scaling_zoom_out,
        max: layer.style.zoomOutScale * 3,
        min: 0,
        step: layer.style.zoomOutScale / 10,
        val: layer.style.zoomOutScale,
      }),
    );
  }

  return mapp.utils.html.node`<div>${content}`;
}
