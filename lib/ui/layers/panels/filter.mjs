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
        updateCount(layer);
        return;
      }

      // Return if filter card already exists.
      if (filter?.card) return;

      // Display clear and reset all button.
      layer.filter.clearAll.style.display = 'inline-block';
      layer.filter.resetAll.style.display = 'inline-block';

      updateCount(layer);

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
    updateCount(layer);
    updateMinMax(layer);
  });

  //Add a hide/show function to the layer callbacks to display and run the count
  layer.showCallbacks.push((layer) => {
    if (layer.filter.clearAll?.checkVisibility()) {
      updateCount(layer);
    }
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
    });
  }

  return layer.filter.view;
}

/**
@function updateCount

@description
The updateCount updates layer.filter.count element with the response from the mapp.ui.utils.locationCount method.

@param {Object} layer
@property {Object} layer.filter The layer filter configuration.
@property {HTMLElement} filter.count The location count element in the filter panel.
*/
async function updateCount(layer) {
  if (!layer.display) return;

  if (!Object.keys(layer.filter?.current).length) {
    layer.filter.feature_count.style.setProperty('display', 'none');
    return;
  }

  const feature_count = await mapp.ui.utils.locationCount(layer);

  layer.filter.count.innerText = feature_count;

  layer.filter.feature_count.style.setProperty('display', 'block');
}

/**
@function updateMinMax

@description
The updateMinMax updates numeric filter elements with new min/max range based on changed viewport.

@param {Object} layer
*/
async function updateMinMax(layer) {
  if (!layer.filter?.viewport) return;
  if (!layer.filter?.list?.length) return;
  // find displayed filters that require viewport update
  const filters_to_update = layer.filter.list.filter(
    (item) => item.card && (item.type == 'numeric' || item.type == 'integer'),
  );
  if (!filters_to_update.length) return;
  //console.log(filters_to_update);
  for (const filter of filters_to_update) {
    //console.log(filter.slider);
    await update_slider_ab(layer, filter);
  }
}

async function update_slider_ab(layer, params) {
  if (!params.slider) return;

  await mapp.ui.layers.filters.generateMinMax(layer, params);

  // hide filter card if one or none found
  if (params.min === params.max) {
    params.card.style.display = 'none';
    return;
  }

  params.card.style.display = 'block';

  const rangeMin = params.slider.querySelector(
    'input[type="range"][data-id="a"]',
  );
  const rangeMax = params.slider.querySelector(
    'input[type="range"][data-id="b"]',
  );
  const textMin = params.slider.querySelector(
    'input[type="text"][data-id="a"]',
  );
  const textMax = params.slider.querySelector(
    'input[type="text"][data-id="b"]',
  );

  //const newA = Math.max(rangeMin.min, Math.min(rangeMin.max, params.min));
  //const newB = Math.max(rangeMin.min, Math.min(rangeMin.max, params.max));

  // to verify current value against new min max
  //if(rangeMin.value < newA)
  //rangeMin.value = newA;
  //if(rangeMax.value > newB)
  //rangeMax.value = newB;
  rangeMin.value = params.min;
  rangeMax.value = params.max;

  rangeMin.min = params.min;
  rangeMin.max = params.max;

  rangeMax.min = params.min;
  rangeMax.max = params.max;

  textMin.value = params.min; //newA;
  textMax.value = params.max; // newB;
  // this is how to set value on the range track
  params.slider.style.setProperty('--a', params.min);
  params.slider.style.setProperty('--b', params.max);
  params.slider.style.setProperty('--min', params.min);
  params.slider.style.setProperty('--max', params.max);
}
