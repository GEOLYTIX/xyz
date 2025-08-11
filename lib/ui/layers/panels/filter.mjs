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
The filterPanel method creates a list of available filter from the layer infoj entries.

A dropdown will be created to select the filter. The dropdown callback will create a filter card element and append this element to the drawer.

A clearAll button is created and appended to the drawer. The clearAll button will only be visible when filter with cards are in the filter.list.

`filter.viewport` can be supplied to limit the count to what is shown in the viewport.

`filter.count_meta` can be specified to change the text displayed on the location count.

`filter.viewport_description` can be specified to describe if the viewport is affecting the filter.

Specifying `layer.filter.drawer: false` will prevent a drawer from being made for the filter panel.

To open the filter panel in a dialog specify `layer.filter.dialog: true`. This can also be specified as an obejct
e.g.

```json
  dialog: {
    title: "Filter Panel"
    btn_label: "Open Filter Panel",
    btn_hover: "Open Filtering View"
    showOnLayerDisplay: true
  }
```

@param {Object} layer 
@property {Array} layer.infoj Array of infoj entries.

@returns {HTMLElement} The filter panel drawer element or filter dialog button.
*/
export default function filterPanel(layer) {
  multi_filter(layer);

  // Do not create the panel.
  if (layer.filter.hidden) return;

  // Layer without an infoj array of entries do not have a filter panel.
  if (!layer.infoj) return;

  layer.filter.exclude ??= [];

  if (layer.filter.includeAll) {
    //Establish include and exclude if not provided
    layer.filter.include = layer.infoj
      .filter((entry) => entry.field)
      .map((entry) => entry.field);

    setFieldFilter(layer);
  }

  layer.filter.include ??= layer.infoj
    .filter((entry) => entry.filter)
    .map((entry) => entry.field);

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
    if (layer.filter.dialog === true) layer.filter.dialog = {};

    layer.filter.dialog.btn_title ??= mapp.dictionary.filter_btn_title;
    layer.filter.dialog.btn_label ??= mapp.dictionary.filter_btn_label;

    layer.filter.dialog_btn = mapp.utils.html.node`<button 
    class="flat wide primary-colour multi_hover"
    data-id=${`multifilter-${layer.key}`}
    title=${layer.filter.dialog.btn_title}
    onclick=${(e) => {
      // classList.toggle resolves as true when the class is added.
      if (layer.filter.dialog_btn.classList.toggle('active')) {
        openDialog(layer);
      } else {
        // The decorated dialog object has a close method.
        layer.filter.dialog.close();
      }
    }}>${layer.filter.dialog.btn_label}`;

    //Show the dialog on layer display
    if (layer.filter.dialog.showOnLayerDisplay) {
      layer.showCallbacks.push(() => {
        !layer.filter.dialog_btn.classList.contains('active') &&
          layer.filter.dialog_btn.dispatchEvent(new Event('click'));
        return layer;
      });

      layer.display &&
        layer.filter.dialog_btn.dispatchEvent(new Event('click'));
    }

    //Hide the dialog when the layer is hidden
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
        .node`<div data-id="filter-drawer"><h3>${mapp.dictionary.filter_header}</h3>
    ${layer.filter.content}`;
  } else {
    layer.filter.drawer = {
      data_id: `filter-drawer`,
      class: `raised ${layer.filter.classList || ''}`,
      header: mapp.utils.html`
        <h3>${mapp.dictionary.filter_header}</h3>
        <div class="material-symbols-outlined caret"/>`,
      content: layer.filter.dialog_btn || layer.filter.content,
      popout: layer.filter.popout,
      view: layer.view,
    };

    layer.filter.view = mapp.ui.elements.drawer(layer.filter.drawer);
  }

  return layer.filter.view;
}

/**
@function setFieldFilter
@description
Iterates through layer.infoj entries and sets a field type filter where possible.

@param {Object} layer
*/
function setFieldFilter(layer) {
  const filterByType = {
    numeric: 'numeric',
    integer: 'integer',
    text: 'like',
    date: 'date',
    datetime: 'datetime',
    boolean: 'boolean',
  };

  layer.infoj
    .filter((entry) => entry.field !== undefined)
    .filter((entry) => layer.filter.include.includes(entry.field))
    .filter((entry) => !layer.filter.exclude.includes(entry.field))
    .filter((entry) => !entry.skipEntry)
    .forEach((entry) => {
      if (entry.filter === undefined) {
        entry.type ??= 'text';
        if (!new Set(Object.keys(filterByType)).has(entry.type)) return;

        entry.filter = filterByType[entry.type];
      }
    });
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
      .filter((filter) => filter.slider)
      .forEach(async (filter) => {
        await mapp.ui.layers.filters.generateMinMax(layer, filter);
        const slider = mapp.ui.elements.slider_ab(filter);

        filter.slider.replaceWith(slider);
        filter.slider = slider;
      });
  }, 1000);
}

/**
@function openDialog
@description
Opens the filter panel in a dialog.

@param {Object} layer
@property {Object} layer.filter The configuration parameters of the filter on the layer.
*/
function openDialog(layer) {
  //Show the layer when the filter is opened
  layer.show();

  //Call the show function when applicable
  if (layer.filter.dialog.show) return layer.filter.dialog.show();

  layer.filter.dialog.title ??= mapp.dictionary.filter_dialog_title;

  layer.filter.dialog.header = mapp.utils.html`<h1
    >${layer.filter.dialog.title}`;

  layer.filter.filter_list = mapp.utils.html`<div class=filter-list>`;

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

  Object.assign(layer.filter.dialog, {
    data_id: `${layer.key}-filter-dialog`,
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
    onClose: () => {
      // Toggle the active class on the button
      layer.filter.dialog_btn.classList.remove('active');
    },
  });

  mapp.ui.elements.dialog(layer.filter.dialog);

  //Setup a dialog.view so the filter cards can be added to the dialog
  layer.filter.dialog.view =
    layer.filter.dialog.node.querySelector('.filter-list');

  //Display clear all/reset all immediately
  layer.filter.clearAll.style.display = 'inline-block';
  layer.filter.resetAll.style.display = 'inline-block';
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

  console.warn('Legacy multi_filter configuration.');

  if (mapp.layer.multi_filter) return;

  delete layer.filter.hidden;

  layer.filter.dialog = true;
}
