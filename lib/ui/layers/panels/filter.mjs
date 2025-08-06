/**
## /ui/layers/panels/filter

The filter panel module exports the filterPanel method for the creation of a filter panel in the layer view.

Dictionary entries:
- layer_filter_header
- layer_filter_select
- layer_filter_clear_all
- layer_filter_reset_all

@requires /dictionary 

@module /ui/layers/panels/filter
*/

/**
@function filterPanel

@description
The filterPanel method creates a list of available filter from the layer infoj entries.

A dropdown will be created to select the filter. The dropdown callback will create a filter card element and append this element to the drawer.

A clearAll button is created and appended to the drawer. The clearAll button will only be visible when filter with cards are in the filter.list.

`filter.viewport` can be supplied to limit the count to what is shown in the viewport.

Specifying `layer.filter.drawer: false` will prevent a drawer from being made for the filter panel.

@param {Object} layer 
@property {Array} layer.infoj Array of infoj entries.

@returns {HTMLElement} The filter panel drawer element.
*/
export default function filterPanel(layer) {
  // Do not create the panel.
  if (layer.filter.hidden) return;

  // Layer without an infoj array of entries do not have a filter panel.
  if (!layer.infoj) return;

  layer.filter.list = layer.infoj
    .filter((entry) => entry.filter !== undefined)
    .filter((entry) => entry.field !== undefined)
    .map((entry) => {
      // The filter is defined as a string e.g. "like"
      if (typeof entry.filter === 'string') {
        // Create filter object with the filter key value as type.
        entry.filter = {
          field: entry.field,
          type: entry.filter,
        };
      }

      return entry;
    })
    .filter((entry) => Object.hasOwn(mapp.ui.layers.filters, entry.filter.type))
    .filter((entry) => !layer.filter?.exclude?.includes(entry.field))
    .filter((entry) => !entry.skipEntry)
    .map((entry) => {
      // Assign entry.title as filter title if not explicit in filter config.
      entry.filter.title ??= entry.title;

      // Assign entry.field as filter field if not explicit in filter config.
      entry.filter.field ??= entry.field;

      return structuredClone(entry.filter);
    });

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

      layer.filter.view.append(filter.card);
    },
    data_id: `${layer.key}-filter-dropdown`,
    entries: layer.filter.list,
    keepPlaceholder: true,
    multi: true,
    placeholder: mapp.dictionary.layer_filter_select,
  });

  layer.filter.clearAll = mapp.utils.html.node`<button
    data-id=clearall
    class="flat underline"
    onclick=${(e) => {
      layer.filter.list.forEach((filter) =>
        mapp.ui.layers.filters.removeFilter(layer, filter),
      );
    }}>${mapp.dictionary.layer_filter_clear_all}`;

  layer.filter.resetAll = mapp.utils.html.node`<button
    data-id=resetall
    class="flat underline"
    onclick=${(e) => {
      layer.filter.list.forEach((filter) =>
        mapp.ui.layers.filters.resetFilter(layer, filter),
      );
    }}>${mapp.dictionary.layer_filter_reset_all}`;

  layer.filter.count = mapp.utils.html.node`<span class="bold">`;

  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {
    updatePanel(layer);
  });

  layer.showCallbacks.push((layer) => {
    updatePanel(layer);
  });

  layer.hideCallbacks.push((layer) => {
    if (layer.filter.clearAll?.checkVisibility()) {
      layer.filter.feature_count.style.setProperty('display', 'none');
    }
  });

  layer.filter.feature_count = mapp.utils.html.node`
    <p style="display:none">${layer.filter.count} Location(s) match your criteria`;

  if (layer.filter.drawer === false) {
    layer.filter.view = mapp.utils.html
      .node`<div data-id="filter-drawer"><h3>${mapp.dictionary.layer_filter_header}</h3>
    ${layer.filter.dropdown}
    ${layer.filter.clearAll}
    ${layer.filter.resetAll}
    ${layer.filter.feature_count}`;
  } else {
    layer.filter.view = mapp.ui.elements.drawer({
      data_id: `filter-drawer`,
      class: `raised ${layer.filter.classList || ''}`,
      header: mapp.utils.html`
        <h3>${mapp.dictionary.layer_filter_header}</h3>
        <div class="material-symbols-outlined caret"/>`,
      content: mapp.utils.html`
        ${layer.filter.dropdown}
        ${layer.filter.clearAll}
        ${layer.filter.resetAll}
        ${layer.filter.feature_count}`,
      popout: layer.filter.popout,
    });
  }

  return layer.filter.view;
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

  layer.filter.feature_count.style.setProperty('display', 'none');

  if (!Object.keys(layer.filter.current).length) return;

  clearTimeout(layer.filter.debounce);

  // Debounce updatePanel queries by a second.
  layer.filter.debounce = setTimeout(() => {
    mapp.ui.utils.locationCount(layer).then((feature_count) => {
      layer.filter.count.innerText = feature_count;
      layer.filter.feature_count.style.setProperty('display', 'block');
    });

    // generateMinMax is only required for viewport filter.
    if (!layer.filter.viewport) return;

    layer.filter.list
      .filter((filter) => Object.hasOwn(layer.filter.current, filter.field))
      .filter((filter) => filter.type == 'numeric' || filter.type == 'integer')
      .forEach(async (filter) => {
        await mapp.ui.layers.filters.generateMinMax(layer, filter);
        const slider = mapp.ui.elements.slider_ab(filter);

        filter.slider.replaceWith(slider)
        //filter.slider = slider
      });
  }, 1000);
}
