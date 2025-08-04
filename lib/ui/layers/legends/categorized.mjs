/**
### /ui/layers/legends/categorized

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

Dictionary entries:
- layer_style_switch_caption
- layer_style_switch_all
- layer_style_cluster

@requires /dictionary 

@requires /ui/elements/legendIcon
@requires /ui/elements/themeLegendSwitch

@module /ui/layers/legends/categorized
*/

/**
@function categorizedTheme

@description
The categorizedTheme method creates and returns a categorized theme legend for the current layer.style.theme.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The categorized theme legend element.
*/
export default function categorizedTheme(layer) {
  const theme = layer.style.theme;

  theme.filterOnly ??= layer.style.filterOnly;

  theme.legend ??= {};

  theme.legend.grid = [];

  // Make 'left' default alignment.
  theme.legend.alignContents ??= 'left';
  theme.legend.alignContents += ' contents';

  // Switch all control
  theme.legend.switch =
    theme.field && layer.filter && mapp.ui.elements.themeLegendSwitch();

  theme.categories.forEach((cat) => {
    cat.field ??= theme.field;

    // Check whether cat is in current filter.
    cat.disabled ??=
      layer.filter?.current[cat.field]?.ni?.indexOf(cat.value) >= 0;

    if (layer.featureFields && theme.distribution === 'count') {
      // Build a params object to pass to the numericFormatter.
      const params = {
        value: layer.featureFields[cat.field]?.[cat.value],
      };
      cat.count = mapp.utils.formatNumericValue(params);
      if (!cat.disabled && !cat.count) return;
    }

    const catLegendIcon = mapp.ui.elements.legendIcon({
      height: 24,
      width: 24,
      ...(cat._style || cat.style),
    });

    const icon = mapp.utils.html`<div
      style="height: 24px; width: 24px; grid-column: 1;">
      ${catLegendIcon}`;

    const classList = `label ${(layer.filter && 'switch') || ''} ${(cat.disabled && 'disabled') || ''}`;

    const cat_label = cat.label + (cat.count ? ` [${cat.count}]` : '');

    // Cat label with filter function.
    const label = mapp.utils.html`<div
      class=${classList}
      style="grid-column: 2;"
      onclick=${(e) => catToggle(e, layer, cat)}>${cat_label}`;

    cat.node = mapp.utils.html.node`<div 
      data-id=${cat.value}
      class="${theme.legend.alignContents}">
      ${icon}${label}`;

    // Push icon and label into legend grid.
    theme.legend.grid.push(cat.node);
  });

  // Attach row for cluster locations.
  if (layer.style.cluster) {
    // Create cluster icon.
    const icon = mapp.utils.html`
      <div
        style="height: 40px; width: 40px;">
        ${mapp.ui.elements.legendIcon({
          height: 40,
          icon: layer.style.cluster.icon,
          width: 40,
        })}`;

    // Create cluster label.
    const label = mapp.utils.html`
      <div
        class="label">
        ${mapp.dictionary.layer_style_cluster}`;

    // Push icon and label into legend grid.
    theme.legend.grid.push(mapp.utils.html`<div 
      data-id="cluster"
      class=${theme.legend.alignContents}>
      ${icon}${label}`);
  }

  const classList = `contents-wrapper ${theme.legend?.layout || 'grid'} ${
    theme.legend?.nowrap ? 'nowrap' : ''
  }`;

  // if nowrap is set, we need to allow overflow scroll in case of too many items
  const style = theme.legend?.nowrap ? 'overflow: scroll;' : '';

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${theme.legend.switch || ''}
      <div class=${classList} style=${style}>
        ${theme.legend.grid}`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  return theme.legend.node;
}

/**
@function catToggle

@description
The method toggles the disabled class on the event target element.

If toggled [on] the filterAdd method will be called and the style will be set to null.

If toggled [off] the filterRemove method will be called and the style will be restored from the cat._style.

@param {Event} e The cat label click event.
@param {layer} layer The decorated mapp layer.
@param {object} cat The cat object from the theme.
*/
function catToggle(e, layer, cat) {
  const toggle = e.target.classList.toggle('disabled');

  if (toggle) {
    cat.disabled = true;

    filterAdd(layer, cat);

    // Store style to toggle on.
    cat._style = cat.style;

    // The feature should not be rendered.
    cat.style = null;
  } else {
    delete cat.disabled;

    filterRemove(layer, cat);

    // If the filter is defined in the config for initial display of just a subset of catergories, _style may not yet exist.
    cat._style ??= cat.style;

    // Set the style to _style that is a stored style.
    cat.style = cat._style;

    delete cat._style;
  }

  layer.style.theme.filterOnly ? layer.L.changed() : layer.reload();
}

/**
@function filterAdd

@description
Add the cat value to the current filter.

@param {layer} layer The decorated mapp layer.
@param {object} cat The cat object from the theme.
*/
function filterAdd(layer, cat) {
  if (layer.style.theme.filterOnly) return;

  // Create empty field filter object if non exists.
  if (!layer.filter.current[cat.field]) {
    layer.filter.current[cat.field] = {};
  }

  // Create empty NI filter array for field if non exists.
  if (!layer.filter.current[cat.field].ni) {
    layer.filter.current[cat.field].ni = [];
  }

  // Push cat value into the NI filter array.
  layer.filter.current[cat.field].ni.push(cat.keys || cat.value);

  // Flatten the filter in case of arrays filter.
  layer.filter.current[cat.field].ni =
    layer.filter.current[cat.field].ni.flat();

  const filter = layer.filter.list?.find(
    (f) => f.type === 'ni' && f.field === cat.field,
  );

  if (filter?.card) {
    filter.card
      .querySelector('.filter')
      .replaceWith(mapp.ui.layers.filters.ni(layer, filter));
  }
}

/**
@function filterRemove

@description
Remove the cat value to the current filter.

@param {layer} layer The decorated mapp layer.
@param {object} cat The cat object from the theme.
*/
function filterRemove(layer, cat) {
  if (layer.style.theme.filterOnly) return;

  if (Array.isArray(cat.keys)) {
    cat.keys.forEach((key) => {
      // Splice key out of the NI array.
      layer.filter.current[cat.field].ni.splice(
        layer.filter.current[cat.field].ni.indexOf(key),
        1,
      );
    });
  } else {
    // Splice value out of the NI array.
    layer.filter.current[cat.field].ni.splice(
      layer.filter.current[cat.field].ni.indexOf(cat.value),
      1,
    );
  }

  // Delete current field filter if NI array is empty.
  if (!layer.filter.current[cat.field].ni.length) {
    delete layer.filter.current[cat.field].ni;
    if (!Object.keys(layer.filter.current[cat.field]).length) {
      delete layer.filter.current[cat.field];
    }
  }

  const filter = layer.filter.list?.find(
    (f) => f.type === 'ni' && f.field === cat.field,
  );

  if (filter?.card) {
    filter.card
      .querySelector('.filter')
      .replaceWith(mapp.ui.layers.filters.ni(layer, filter));
  }
}
