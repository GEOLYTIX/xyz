/**
## /ui/layers/panels/filter

The filter panel module exports the filterPanel method for the creation of a filter panel in the layer view.

Dictionary entries:
- filter_header
- filter_select
- filter_clear_all
- filter_reset_all
- filter_btn_label
- filter_btn_title
- filter_count
- filter_in_viewport
- filter_not_in_viewport

@requires /dictionary

@module /ui/layers/panels/filter
*/

/**
@function filterPanel

@description
The filterPanel method will call the multi_filter method to update the filter configuration in regards to the legacy multi_filter plugin.

The method will shortcircuit if the filter panel is set to be hidden or if the layer has no infoj entries to create a list of filter.

@param {layer} layer

@property {array} layer.infoj Array of infoj entries.
@property {object} layer.filter Configuration object for layer filter.
@property {boolean} [filter.hidden] The filter panel should not be displayed.
@property {boolean} [filter.popout] Whether the drawer can be popped out into a dialog.
@property {string} [filter.classList] The string will be appended to the drawer element classlist.
@returns {HTMLElement} The filter panel drawer element or filter dialog button.
*/
export default function filterPanel(layer) {
  multi_filter(layer);

  if (layer.filter.hidden) return;

  if (!layer.infoj) return;

  layer.filter.list = listFilter(layer);

  if (!layer.filter.list.length) return;

  layer.filter.dropdown = mapp.ui.elements.dropdown({
    callback: async (e, options, filter) => {
      if (!filter.selected) {
        mapp.ui.layers.filters.removeFilter(layer, filter);
        updatePanel(layer);
        return;
      }

      // Return if filter card already exists.
      if (filter?.card) return;

      // Display clear and reset all button.
      layer.filter.clearAll.style.display = 'inline-block';
      layer.filter.resetAll.style.display = 'inline-block';

      updatePanel(layer);

      // Get interface content for filter card.
      filter.content = [
        await mapp.ui.layers.filters[filter.type](layer, filter),
      ].flat();

      // Add meta element to beginning of contents array.
      filter.meta &&
        filter.content.unshift(mapp.utils.html.node`<p>${filter.meta}`);

      filter.header = filter.title;

      filter.close = () => mapp.ui.layers.filters.removeFilter(layer, filter);

      filter.card = mapp.ui.elements.card(filter);

      //Append the card to the dialog view instead.
      if (layer.filter.dialog?.view)
        return layer.filter.dialog.view.append(filter.card);
      if (layer.filter.drawer?.popout?.view?.checkVisibility?.()) {
        return layer.filter.drawer.popout.view.append(filter.card);
      }

      layer.filter.view.querySelector('.content').append(filter.card);
    },
    data_id: `${layer.key}-filter-dropdown`,
    entries: layer.filter.list,
    keepPlaceholder: true,
    multi: true,
    placeholder: mapp.dictionary.filter_select,
  });

  layer.filter.clearAll = mapp.utils.html.node`<button
    data-id=clearall
    class="flat underline"
    onclick=${(e) => {
      layer.filter.list.forEach((filter) =>
        mapp.ui.layers.filters.removeFilter(layer, filter),
      );
    }}>${mapp.dictionary.filter_clear_all}`;

  layer.filter.resetAll = mapp.utils.html.node`<button
    data-id=resetall
    class="flat underline"
    onclick=${(e) => {
      layer.filter.list.forEach((filter) =>
        mapp.ui.layers.filters.resetFilter(layer, filter),
      );
    }}>${mapp.dictionary.filter_reset_all}`;

  layer.filter.count = mapp.utils.html.node`<span class="bold">`;

  layer.changeEndCallbacks.push(updatePanel);

  layer.hideCallbacks.push((layer) => {
    if (layer.filter.clearAll?.checkVisibility()) {
      layer.filter.feature_count.style.setProperty('display', 'none');
    }
  });

  layer.filter.count_meta ??= mapp.dictionary.filter_count;

  layer.filter.feature_count = mapp.utils.html.node`
    <p style="display:none">${layer.filter.count} ${layer.filter.count_meta}`;

  layer.filter.viewport_description ??= layer.filter.viewport
    ? mapp.dictionary.filter_in_viewport
    : mapp.dictionary.filter_not_in_viewport;

  layer.filter.viewport_description = mapp.utils.html
    .node`<p style="display:none"><i>${layer.filter.viewport_description}</i>`;

  layer.filter.content = [
    layer.filter.dropdown,
    layer.filter.clearAll,
    layer.filter.resetAll,
    layer.filter.feature_count,
    layer.filter.viewport_description,
  ];

  if (layer.filter.dialog) {
    //Rearrange the content for the dialog.
    layer.filter.filter_list = mapp.utils
      .html`<div id=filter-list class=filter-list>`;

    layer.filter.content = [
      mapp.utils.html`<p class=bold>${layer.name}</p>`,
      layer.filter.feature_count,
      layer.filter.viewport_description,
      layer.filter.clearAll,
      layer.filter.resetAll,
      layer.filter.dropdown,
      layer.filter.filter_list,
    ];

    layer.filter.content = mapp.utils.html.node`${layer.filter.content}`;

    const panelType = {
      key: 'filter',
      name: 'Filter',
      icon: layer.filter.dialog.btnIcon || 'filter_alt',
      setView: 'filter-list',
    };

    mapp.ui.utils.panelDialog(layer, panelType);

    //Display clear all/reset all immediately
    layer.filter.clearAll.style.display = 'inline-block';
    layer.filter.resetAll.style.display = 'inline-block';
  }

  if (layer.filter.drawer === false) {
    layer.filter.view =
      layer.filter.dialog?.btn ||
      mapp.utils.html
        .node`<div data-id="filter-drawer"><h3>${mapp.dictionary.filter_header}</h3>
    ${layer.filter.content}`;
  } else {
    layer.filter.drawer = {
      data_id: `filter-drawer`,
      class: layer.filter.classList || '',
      header: mapp.utils.html`
        <h3>${mapp.dictionary.filter_header}</h3>
        <div class="notranslate material-symbols-outlined caret"/>`,
      content: layer.filter.dialog?.btn || layer.filter.content,
      popout: layer.filter.popout,
      view: layer.view,
    };

    layer.filter.view = mapp.ui.elements.drawer(layer.filter.drawer);
  }

  return layer.filter.view;
}

/**
@function listFilter
@description
Parse layer.infoj entries to create a list of layer filter objects.

Any entry with a filter defintion will be included in the list unless specifically excluded in the layer.filter configuration.

A filter definition will be created for all entries if possible with the includeAll layer.filter flag or if the entry.field is in the layer.filter.include[] array.

@param {Object} layer
@property {Object} layer.filter Configuration object for layer filter.
@property {Array} [filter.exclude] Array of filter [fields] which are excluded in the filter list.
@property {Array} [filter.include] Array of filter [fields] which should be included in the filter list.
@property {Boolean} [filter.includeAll] Include all possible infoj entry in filter list.

@returns {Array} Array of cloned entry.filter
*/
const filterByType = {
  numeric: 'numeric',
  integer: 'integer',
  text: 'like',
  date: 'date',
  datetime: 'datetime',
  boolean: 'boolean',
};
function listFilter(layer) {
  const list = [];

  layer.filter.include ??= [];

  layer.filter.exclude ??= [];

  for (const entry of layer.infoj) {
    if (
      entry.skipEntry === true ||
      entry.field === undefined ||
      layer.filter.exclude.includes(entry.field)
    )
      continue;

    if (
      layer.filter.includeAll ||
      layer.filter.include.includes(entry.field) ||
      entry.filter === true
    ) {
      entry.type ??= 'text';

      if (!Object.hasOwn(filterByType, entry.type)) continue;

      if (!Object.keys(entry.filter || {}).length)
        entry.filter = filterByType[entry.type];
    }

    // The filter is defined as a string e.g. "like"
    if (typeof entry.filter === 'string') {
      entry.filter = {
        type: entry.filter,
      };
    }

    if (
      !entry.filter?.type ||
      !Object.hasOwn(mapp.ui.layers.filters, entry.filter.type)
    )
      continue;

    entry.filter.title ??= entry.title;

    entry.filter.field ??= entry.field;

    list.push(structuredClone(entry.filter));
  }

  return list;
}

/**
@function updatePanel

@description
The updatePanel method is triggered either from a layer.showCallbacks[] method or from the mapview.Map changeend event listener. The execution of the queries is therefore debounced to 1 second to prevent multiple expensive queries running at the same time. The method will shortcircuit if the layer is not displayed nor has current filter.

The method will hide the location count prior to the debounce.

Within the debounce the location count will be executed. The min max will be generated for current integer or numeric filter.

@param {Object} layer
@property {Object} layer.filter The layer filter configuration.
@property {Object} filter.current The filter currently applied to the layer.
@property {Boolean} filter.viewport The filter are restricted to the mapview viewport.
@property {HTMLElement} filter.count The location count element in the filter panel.
*/
function updatePanel(layer) {
  if (!layer.display) return;

  clearTimeout(layer.filter.debounce);

  // Debounce updatePanel queries by a second.
  layer.filter.debounce = setTimeout(async () => {
    for (const filter of layer.filter.list) {
      // Filter in list must be a current filter.
      if (!Object.hasOwn(layer.filter.current, filter.field)) continue;

      if (filter.min === undefined) continue;
      if (filter.max === undefined) continue;
      if (filter.Min && filter.Max) continue;

      await mapp.ui.layers.filters.generateMinMax(layer, filter);

      const range = filter.max - filter.min;

      if (range === 0) continue;

      const slider = mapp.ui.elements.slider_ab(filter);

      filter.slider.replaceWith(slider);
      filter.slider = slider;
    }

    mapp.ui.utils.locationCount(layer).then((feature_count) => {
      const value = mapp.utils.formatNumericValue({
        value: feature_count,
      });

      layer.filter.count.innerText = value;
      layer.filter.feature_count.style.setProperty('display', 'block');
    });
  }, 1000);
}

/**
@function multi_filter

@description
Support for multi_filter legacy plugin and configuration.
Warning will be issued if the multi_filter plugin is configured.
The filter panel method will shortcircuit with the hidden flag set by the multi_filter plugin.
The hidden flag property will be deleted with the multi_filter layer configuration but the plugin not loaded.
*/
function multi_filter(layer) {
  if (!layer.multi_filter) return;

  if (mapp.layer.multi_filter) return;

  delete layer.filter.hidden;

  layer.filter.dialog = true;
  layer.filter.drawer = false;
  layer.filter.includeAll = true;
}
