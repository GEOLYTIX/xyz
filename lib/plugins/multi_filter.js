/**
The multi_filter plugin must be enabled in the layer config by adding the multi_filter object property to the layer json.

```json
multi_filter: {
  title: "Filter Panel"
  btn_label: "Open Filter Panel",
  btn_hover: "Open Filtering View"
  target: "layer",
  layer_filter: false,
  viewport: true
  showOnLayerDisplay: true
}
```

The viewport flag controls whether the location count passing the filter should consider the current viewport.

The multi_filter plugin [panel] method adds a panel element to the layer view.

The panel takes all fields specified in the infoj and makes them available for filtering.

Location count is only available on wkt format as this is the only format that exposes a reliable feature count.

the layer_filter property will hide or show the core filter panel. the property set on multi_filter is checked first, then `layer.filter.hidden`. Defaults to false.

showOnLayerDisplay controls whether toggling the layer on will also show the multi_filter panel.

To exclude fields from the infoj:
filter:{
  "exclude": ["field_1","field_2"]
}

To include fields from the infoj:
filter:{
  "include": ["field_1","field_2"]
}
  @module multi_filter
*/

mapp.utils.versionCheck?.('4.13')
  ? console.log(`multi_filter v4.13`)
  : console.warn(
      `Mapp version below v4.13. Please use the v4.8 multi_filter plugin instead.`,
    );

mapp.utils.merge(mapp.dictionaries, {
  en: {
    multi_filter_title: 'Multi Filter Panel',
    multi_filter_btn_label: 'Open Filter Panel',
    multi_filter_btn_hover: 'Open Filtering View',
    multi_filter_count: 'Location(s) match filter criteria',
    multi_filter_layer_name: 'Layer Filter',
    multi_filter_in_viewport: 'viewport based.',
    multi_filter_not_in_viewport: 'all locations not just those in viewport.',
  },
});

//Styling used for the plugin.
//We set the overflow on the multi-filter-list to auto so that other elements that need to be visible outside of the list will be.
document.head.prepend(mapp.utils.html.node`<style>
.multi-filter-dialog {

  & .multi-filter-list {
    overflow-y: scroll;
    max-height: 350px;
  }

}}`);

mapp.ui.layers.filters.byType = {
  numeric: 'numeric',
  integer: 'integer',
  text: 'like',
  date: 'date',
  datetime: 'datetime',
  boolean: 'boolean',
};

// Add updateCount to reloadCallback method
mapp.ui.layers.filters.reloadCallback = mapp.utils.compose(
  mapp.ui.layers.filters.reloadCallback.bind(),
  updateCount,
);

mapp.ui.layers.panels.multi_filter = multi_filter_panel;

mapp.layer.multi_filter = layerFilterApply;

/**
 * @function layerFilterApply
 * @description
 * The layerFilterApply method is assigned as mapp.layer.multi_filter and will be called with layer as argument if the multi_filter object property is configured in the layer JSON when the layer view is created.
 * This method is used to hide the core filter panel when the multi_filter property is defined on a layer.
 * @param {Object} layer The layer object.
 */
function layerFilterApply(layer) {
  layer.filter.hidden = true;
}

/**
@function multi_filter_panel
@description
The multi_filter_panel method is assigned as mapp.ui.layers.panels.multi_filter() and will be called with layer as argument if the multi_filter object property is configured in the layer JSON when the layer view is created.

@param {Object} layer
@property {string} layer.key The key assigned to the layer.
@property {Object} layer.multi_filter The multi_filter configuration.
@property {string} multi_filter.btn_label The label on the button.
@property {string} multi_filter.btn_hover The text that appears when you hover over the button.
@property {string} [multi_filter.target='dialog'] Target element for the multi_filter panel.
@property {string} [multi_filter.layer_filter=false] Whether or not to hide the core filter panel. Defaults to not showing the layer filter.
@property {string} [multi_filter.layer_toggle] Whether or not to open the multi_filter when the layer is toggled on.
@returns {HTMLElement} The button which will spawn filter panel
*/
function multi_filter_panel(layer) {
  layer.multi_filter.title ??= mapp.dictionary.multi_filter_title;

  layer.multi_filter.btn_label ??= mapp.dictionary.multi_filter_btn_label;

  layer.multi_filter.btn_hover ??= mapp.dictionary.multi_filter_btn_hover;

  setFieldFilter(layer);

  if (!layer.multi_filter.filter.length) return;

  multi_filter_content(layer);

  // Assign changeEnd event listener to check whether the updateCount should be called with a viewport.
  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {
    layer.multi_filter.viewport && updateCount(layer);
  });

  layer.multi_filter.target ??= 'dialog';

  if (layer.multi_filter.target === 'dialog') {
    layer.multi_filter.btn = mapp.utils.html.node`<button 
    class="flat wide primary-colour multi_hover"
    data-id=${`multifilter-${layer.key}`}
    title=${layer.multi_filter.btn_hover}
    onclick=${(e) => {
      // classList.toggle resolves as true when the class is added.
      if (e.target.classList.toggle('active')) {
        openDialog(layer);
      } else {
        // The decorated dialog object has a close method.
        layer.multi_filter.close();
      }
    }}>${layer.multi_filter.btn_label}`;

    if (layer.multi_filter.showOnLayerDisplay) {
      layer.showCallbacks.push(() => {
        !layer.multi_filter.btn.classList.contains('active') &&
          layer.multi_filter.btn.dispatchEvent(new Event('click'));
        return layer;
      });

      layer.display && layer.multi_filter.btn.dispatchEvent(new Event('click'));
    }

    layer.hideCallbacks.push(() => {
      layer.multi_filter.btn.classList.contains('active') &&
        layer.multi_filter.btn.dispatchEvent(new Event('click'));
      return layer;
    });

    return layer.multi_filter.btn;
  } else if (layer.multi_filter.target === 'layer') {
    layer.multi_filter.classList ??= '';

    layer.multi_filter.class = `raised ${layer.style.classList}`;

    // Create header for layer.view style drawer.
    layer.multi_filter.header = mapp.utils.html`
      <h3>${layer.multi_filter.title}</h3>
      <div class="material-symbols-outlined caret"/>`;

    layer.multi_filter.data_id = `multi_filter-drawer`;

    layer.multi_filter.drawer = mapp.ui.elements.drawer(layer.multi_filter);

    if (layer.multi_filter.showOnLayerDisplay) {
      layer.showCallbacks.push(() => {
        !layer.multi_filter.drawer.classList.contains('expanded') &&
          layer.multi_filter.drawer
            .querySelector('.header')
            .dispatchEvent(new Event('click'));
        return layer;
      });

      layer.display &&
        layer.multi_filter.drawer
          .querySelector('.header')
          .dispatchEvent(new Event('click'));
    }

    layer.hideCallbacks.push(() => {
      layer.multi_filter.drawer.classList.contains('expanded') &&
        layer.multi_filter.drawer
          .querySelector('.header')
          .dispatchEvent(new Event('click'));
      return layer;
    });

    return layer.multi_filter.drawer;
  }
}

/**
@function setFieldFilter
@description
Iterates through layer.infoj entries and sets a field type filter where possible.

@param {Object} layer
*/
function setFieldFilter(layer) {
  layer.filter.include ??= layer.infoj
    .filter((entry) => entry.field)
    .map((entry) => entry.field);
  layer.filter.exclude ??= [];

  layer.multi_filter.filter = layer.infoj
    .filter((entry) => entry.field !== undefined)
    .filter((entry) => layer.filter.include.includes(entry.field))
    .filter((entry) => !layer.filter.exclude.includes(entry.field))
    .filter((entry) => !entry.skipEntry)
    .map((entry) => {
      // The filter is defined as a string e.g. 'like'
      if (typeof entry.filter === 'string') {
        // Create filter object with the filter key value as type.
        entry.filter = {
          type: entry.filter,
          field: entry.field,
        };
      }

      if (entry.filter === undefined) {
        entry.type ??= 'text';
        if (!new Set(['integer', 'text', 'numeric']).has(entry.type)) return;

        entry.filter ??= {
          type: mapp.ui.layers.filters.byType[entry.type],
          fieldtype: entry.type,
        };
      }

      // Assign entry.title as filter title if not explicit in filter config.
      entry.filter.title ??= entry.title;

      // Assign entry.field as filter field if not explicit in filter config.
      entry.filter.field ??= entry.field;

      return structuredClone(entry.filter);
    })
    .filter((entry) => !!entry);
}

/**
@function updateCount
@description
The updateCount method will be composed into the mapp.ui.layers.filters.reloadCallback method.

After a layer is reloaded, for example after a filter is applied, or removed, the updateCount method will query the number of locations which will pass the current layer filter.

@param {Object} layer

@returns {object} The layer argument must be returned to enable function composition.
*/
async function updateCount(layer) {
  //Do nothing if no table current is available
  if (!layer.tableCurrent()) return;

  if (!layer.multi_filter?.info) return layer;

  const params = mapp.utils.queryParams({
    layer: layer,
    queryparams: {},
    viewport: layer.multi_filter.viewport,
  });

  const paramString = mapp.utils.paramString({
    ...params,
    template: 'location_count',
    table: layer.tableCurrent(),
    filter: layer.filter?.current,
    layer: layer.key,
  });

  const feature_count = await mapp.utils.xhr(
    `${layer.mapview.host}/api/query?${paramString}`,
  );

  // Convert the feature_count to a formatted number.
  const NumericParams = {
    value: feature_count,
  };

  const feature_count_formatted = mapp.utils.formatNumericValue(NumericParams);

  layer.multi_filter.count_meta ??= mapp.dictionary.multi_filter_count;
  layer.multi_filter.viewport_description ??= layer.multi_filter.viewport
    ? mapp.dictionary.multi_filter_in_viewport
    : mapp.dictionary.multi_filter_not_in_viewport;

  mapp.utils.render(
    layer.multi_filter.info,
    mapp.utils.html`<p>
      <span class="bold">${feature_count_formatted} </span>${layer.multi_filter.count_meta}
      <br>
      <span style="font-style:italic;">${layer.multi_filter.viewport_description}</span>`,
  );

  // The layer must be returned in order to compose this method with reloadCallback
  return layer;
}

/**
@function multi_filter_content
@description
This provides the content for the multi_filter panel.

@param {Object} layer
@property {Object} layer.multi_filter multi_filter configuration.
*/
function multi_filter_content(layer) {
  // This must be a node in order to use the render util.
  layer.multi_filter.info = mapp.utils.html.node`<div>`;

  layer.multi_filter.dropdown_placeholder ??=
    mapp.dictionary.layer_filter_select;

  layer.multi_filter.dropdown = mapp.ui.elements.dropdown({
    data_id: `${layer.key}-filter-dropdown`,
    placeholder: layer.multi_filter.dropdown_placeholder,
    keepPlaceholder: true,
    entries: layer.multi_filter.filter,
    callback: async (e, filter) => {
      // Return if filter card already exists.
      if (filter?.card) return;

      // Get interface content for filter card.
      const content = [
        await mapp.ui.layers.filters[filter.type](layer, filter),
      ].flat();

      // Add meta element to beginning of contents array.
      filter.meta && content.unshift(mapp.utils.html`<p>${filter.meta}`);

      filter.content = content;

      filter.header = filter.title;

      filter.card = mapp.ui.elements.card(filter);

      filter.close = () => {
        mapp.ui.layers.filters.removeFilter(layer, filter);
      };

      layer.multi_filter.list_element.append(filter.card);
    },
  });

  layer.multi_filter.list_element = mapp.utils.html
    .node`<div class="multi-filter-list">`;

  layer.multi_filter.btn_clearall = mapp.utils.html`<button
    style="display:inline-block"
    class="flat underline"
    onclick=${(e) => {
      layer.multi_filter.filter.forEach((filter) =>
        mapp.ui.layers.filters.removeFilter(layer, filter),
      );
    }}>${mapp.dictionary.layer_filter_clear_all}`;

  layer.multi_filter.btn_resetall = mapp.utils.html`<button
    style="display:inline-block;"
    class="flat underline"
    onclick=${(e) => {
      layer.multi_filter.filter.forEach((filter) =>
        mapp.ui.layers.filters.resetFilter(layer, filter),
      );
    }}>${mapp.dictionary.layer_filter_reset_all}`;

  layer.multi_filter.layer_name = mapp.utils.html`<span class="bold">${
    layer.name || layer.key || mapp.dictionary.multi_filter_layer_name
  }`;

  layer.multi_filter.content = mapp.utils.html`<div>
    ${layer.multi_filter.layer_name}
    ${layer.multi_filter.info}
    ${layer.multi_filter.btn_resetall}
    ${layer.multi_filter.btn_clearall}
    ${layer.multi_filter.dropdown}
    ${layer.multi_filter.list_element}`;
}

/**
@function openDialog
@description
Opens the multi filter panel in a dialog.

@param {Object} layer
@property {Object} layer.multi_filter The configuration paramters of the filter panel
*/
async function openDialog(layer) {
  layer.show();

  layer.multi_filter.header = mapp.utils.html`<h1
    class="multi-filter-header">${layer.multi_filter.title}`;

  Object.assign(layer.multi_filter, {
    data_id: `${layer.key}-multi-filter-dialog`,
    target: document.getElementById('Map'),
    height: 'auto',
    left: '83%',
    top: '0.5em',
    class: 'multi-filter-dialog box-shadow',
    css_style: 'min-width: 300px;',
    containedCentre: true,
    contained: true,
    headerDrag: true,
    minimizeBtn: true,
    closeBtn: true,
    onClose: (e) => {
      // Remove the active class from the button
      layer.multi_filter.btn.classList.remove('active');
    },
  });

  mapp.ui.elements.dialog(layer.multi_filter);
}
