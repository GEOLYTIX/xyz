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

  //Establish include and exclude if not provided
  layer.filter.include ??= layer.infoj
    .filter((entry) => entry.field)
    .map((entry) => entry.field);

  layer.filter.exclude ??= [];

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
    .filter((entry) => layer.filter.include.includes(entry.field))
    .filter((entry) => !layer.filter.exclude.includes(entry.field))
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

      if (layer.filter.dialog?.view)
        return layer.filter.dialog.view.append(filter.card);

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

  layer.filter.count_meta ??= mapp.dictionary.multi_filter_count;

  layer.filter.feature_count = mapp.utils.html.node`
    <p style="display:none">${layer.filter.count} ${layer.filter.count_meta}`;

  layer.filter.viewport_description ??= layer.filter.viewport
    ? mapp.dictionary.multi_filter_in_viewport
    : mapp.dictionary.multi_filter_not_in_viewport;

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
    if (layer.filter.dialog === true) layer.filter.dialog = {};

    layer.filter.dialog.btn_title ??= mapp.dictionary.multi_filter_btn_title;
    layer.filter.dialog.btn_label ??= mapp.dictionary.multi_filter_btn_label;

    layer.filter.dialog_btn = mapp.utils.html.node`<button 
    class="flat wide primary-colour multi_hover"
    data-id=${`multifilter-${layer.key}`}
    title=${layer.filter.dialog.btn_title}
    onclick=${(e) => {
      // classList.toggle resolves as true when the class is added.
      if (e.target.classList.toggle('active')) {
        openDialog(layer);
      } else {
        // The decorated dialog object has a close method.
        layer.filter.dialog.close();
      }
    }}>${layer.filter.dialog.btn_label}`;

    if (layer.filter.dialog.showOnLayerDisplay) {
      layer.showCallbacks.push(() => {
        !layer.filter.dialog_btn.classList.contains('active') &&
          layer.filter.dialog_btn.dispatchEvent(new Event('click'));
        return layer;
      });

      layer.display &&
        layer.filter.dialog_btn.dispatchEvent(new Event('click'));
    }

    layer.hideCallbacks.push(() => {
      layer.filter.dialog_btn.classList.contains('active') &&
        layer.filter.dialog_btn.dispatchEvent(new Event('click'));
      return layer;
    });
  }

  if (layer.filter.drawer === false) {
    layer.filter.view =
      layer.filter.dialog_btn ||
      mapp.utils.html
        .node`<div data-id="filter-drawer"><h3>${mapp.dictionary.layer_filter_header}</h3>
    ${layer.filter.content}`;
  } else {
    layer.filter.view = mapp.ui.elements.drawer({
      data_id: `filter-drawer`,
      class: `raised ${layer.filter.classList || ''}`,
      header: mapp.utils.html`
        <h3>${mapp.dictionary.layer_filter_header}</h3>
        <div class="material-symbols-outlined caret"/>`,
      content: layer.filter.dialog_btn || layer.filter.content,
      popout: layer.filter.popout,
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
    layer.filter.dialog &&
      layer.filter.viewport_description.style.setProperty('display', 'none');
    return;
  }

  const feature_count = await mapp.ui.utils.locationCount(layer);

  layer.filter.count.innerText = feature_count;

  layer.filter.feature_count.style.setProperty('display', 'block');
  layer.filter.dialog &&
    layer.filter.viewport_description.style.setProperty('display', 'block');
}

function openDialog(layer) {
  layer.show();

  if (layer.filter.dialog.show) return layer.filter.dialog.show();

  layer.filter.dialog.title ??= mapp.dictionary.multi_filter_title;

  layer.filter.dialog.header = mapp.utils.html`<h1
    class="multi-filter-header">${layer.filter.dialog.title}`;

  layer.filter.content = [
    mapp.utils
      .html`<p class=bold style="padding-bottom: 5px">${layer.name}</p>`,
    layer.filter.feature_count,
    layer.filter.viewport_description,
    layer.filter.clearAll,
    layer.filter.resetAll,
    layer.filter.dropdown,
  ];

  layer.filter.content = mapp.utils.html.node`${layer.filter.content}`;

  Object.assign(layer.filter.dialog, {
    data_id: `${layer.key}-multi-filter-dialog`,
    target: document.getElementById('Map'),
    content: layer.filter.content,
    height: 'auto',
    left: '5em',
    top: '0.5em',
    class: 'box-shadow',
    css_style: 'min-width: 300px;width: 350px',
    containedCentre: true,
    contained: true,
    headerDrag: true,
    minimizeBtn: true,
    closeBtn: true,
    onClose: (e) => {
      // Remove the active class from the button
      layer.filter.dialog_btn.classList.toggle('active');
    },
  });

  mapp.ui.elements.dialog(layer.filter.dialog);

  layer.filter.dialog.view = layer.filter.dialog.node.querySelector('.content');

  layer.filter.clearAll.style.display = 'inline-block';
  layer.filter.resetAll.style.display = 'inline-block';
}
