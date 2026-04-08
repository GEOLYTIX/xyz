/**
## /ui/layers/legends/utils

The categorized theme legend module exports the categorizedTheme to the `ui.layers.legend{}` library object.

Dictionary entries:
  - layer_style_switch_caption
  - layer_style_switch_all
  - layer_style_cluster

@requires /dictionary

@module /ui/layers/legends/utils
*/

/**
@function catElement
@description
Create legend entry for category within a theme.

@param {Object} cat The category object.
@param {Object} theme The theme configuration object.
@param {Object} layer The layer object.

@returns {HTMLElement} The cat element for the legend grid.
**/
export function catElement(cat, theme, layer) {
  cat.field ??= theme.field;

  // Check whether cat is in current filter.
  cat.disabled ??= layer.filter?.current[cat.field]?.ni?.includes(cat.value);

  if (!cat.disabled) {
    // The style must be restored for the theme layer render.
    cat.style ??= cat._style;
  }

  if (layer.featureFields && theme.distribution === 'count') {
    // Build a params object to pass to the numericFormatter.
    const params = {
      value: layer.featureFields[cat.field]?.[cat.value],
    };
    cat.count = mapp.utils.formatNumericValue(params);
    if (!theme.legend?.showEmptyCat && !cat.count) return;
  }

  const catLegendIcon = mapp.ui.elements.legendIcon({
    height: 24,
    width: 24,
    ...(cat._style || cat.style),
  });

  const icon = mapp.utils.html`<div
    style="height: 24px; width: 24px; grid-column: 1;">
    ${catLegendIcon}`;

  const classList = ['label'];

  if (layer.filter) {
    classList.push('switch');
  }

  if (cat.disabled) {
    classList.push('disabled');
  }

  const cat_label = cat.label + (cat.count ? ` [${cat.count}]` : '');

  const label = mapp.utils.html.node`<div
    class=${classList.join(' ')}>
    ${cat_label}`;

  label.onclick = (e) => catToggle(e, layer, cat);

  cat.node = mapp.utils.html.node`<div
    data-id=${cat.value}
    class="contents">
    ${icon}${label}`;

  return cat.node;
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
export function catToggle(e, layer, cat) {
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
@async

@description
Add the cat value to the current filter.

@param {layer} layer The decorated mapp layer.
@param {object} cat The cat object from the theme.
*/
async function filterAdd(layer, cat) {
  if (layer.style.theme.filterOnly) return;

  const inFilter = layer.filter.list?.find(
    (f) => f.type === 'in' && f.field === cat.field,
  );

  if (inFilter?.card) {
    // Remove filter set in filterpanel.
    mapp.ui.layers.filters.removeFilter(layer, inFilter);
  }

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
    const filterElement = await mapp.ui.layers.filters.ni(layer, filter);
    filter.card.querySelector('.filter').replaceWith(filterElement);
  }
}

/**
@function filterRemove
@async

@description
Remove the cat value to the current filter.

@param {layer} layer The decorated mapp layer.
@param {object} cat The cat object from the theme.
*/
async function filterRemove(layer, cat) {
  if (layer.style.theme.filterOnly) return;

  if (Array.isArray(cat.keys)) {
    for (const cat of cat.keys) {
      // Splice key out of the NI array.
      layer.filter.current[cat.field].ni.splice(
        layer.filter.current[cat.field].ni.indexOf(key),
        1,
      );
    }
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
    const filterElement = await mapp.ui.layers.filters.ni(layer, filter);
    filter.card.querySelector('.filter').replaceWith(filterElement);
  }
}

/**
@function clusterLegend
@description
Adds a cluster icon for the theme.

@param layer The layer the theme exists on.

@returns {HTMLElement} The cat element for the legend grid.
**/
export function clusterLegend(layer) {
  // Create cluster icon.
  const icon = mapp.utils.html`<div
    style="height: 40px; width: 40px;">
    ${mapp.ui.elements.legendIcon({
      height: 40,
      icon: layer.style.cluster.icon,
      width: 40,
    })}`;

  // Create cluster label.
  const label = mapp.utils.html`<div
    class="label">
    ${mapp.dictionary.layer_style_cluster}`;

  // Push icon and label into legend grid.
  const el = mapp.utils.html`<div
    data-id="cluster"
    class="contents">
    ${icon}${label}`;

  return el;
}

/**
@function themeLegend
@description
The method assigns theme.legend properties to control the layout through css classes.

@param {object} theme
@property {object} theme.legend The configuration for the theme legend.
**/
export function themeLegend(theme) {
  theme.legend ??= {};

  theme.legend.layout ??= 'grid';

  const classList = ['contents-wrapper', theme.legend.layout];

  if (theme.legend.nowrap) {
    classList.push('nowrap');
  }

  theme.legend.classList = classList.join(' ');
}

/**
@function themeLegendSwitch

@description
The method returns a HTMLElement with a button which toggles all label elements in the legend.

@returns {HTMLElement} HTMLElement with nested button.
*/
export function themeLegendSwitch() {
  return mapp.utils.html`<div
    class="switch-all"
    style="grid-column: 1/3;">
    ${mapp.dictionary.layer_style_switch_caption}
    <button
      class="bold"
      onclick=${(e) => {
        const allSwitches = [
          ...e.target.closest('.legend').querySelectorAll('.switch'),
        ];
        const disabledSwitches = allSwitches.filter((switch_) =>
          switch_.classList.contains('disabled'),
        );

        if (
          disabledSwitches.length == 0 ||
          disabledSwitches.length == allSwitches.length
        ) {
          // if all switches are either enabled or disabled, click on all
          allSwitches.forEach((switch_) => switch_.click());
        } else {
          // if only some of them are enabled, click only on disabled ones
          disabledSwitches.forEach((switch_) => switch_.click());
        }
      }}>${mapp.dictionary.layer_style_switch_all}
    </button>.`;
}
