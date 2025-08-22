/**
## mapp.ui.layers.filters[type](layer, filter)

The ui/layers/filters module exports a lookup object for the different layer filter type methods.

- like
- match
- numeric
- integer
- in
- ni
- date
- datetime
- boolean
- null

Dictionary entries:
- identical_values_filter
- no_data_filter
- layer_filter_greater_than
- layer_filter_less_than
- filter_searchbox_placeholder
- no_results

@requires /dictionary

@module /ui/layers/filters
*/

const filterMethods = {
  applyFilter,
  boolean: filter_boolean,
  date: filter_date,
  datetime: filter_date,
  in: filter_in,
  integer: filter_numeric,
  like: filter_text,
  match: filter_text,
  ni: filter_in,
  null: filter_null,
  numeric: filter_numeric,
  removeFilter,
  resetFilter,
  generateMinMax,
};

export default filterMethods;

/**
@function applyFilter

@description
The applyFilter method is used to debounce the layer.reload() from filter. This is required in order to not fire layer [data] reload in quick succession by moving a slider element.

The 'changeEnd' event is dispatched the layer.mapview in order to trigger the update of dataviews with the mapChange flag.

@param {Object} layer The layer to reload.
*/
let timeout;
function applyFilter(layer) {
  clearTimeout(timeout);

  // Debounce layer reload by 500
  timeout = setTimeout(() => {
    layer.reload();

    layer.filter.list?.forEach((filter) => {
      filter.histogram?.update?.();
    });

    // The 'changeEnd' event triggers dataview updates with the mapChange flag.
    layer.mapview?.Map.getTargetElement().dispatchEvent(new Event('changeEnd'));
  }, 500);
}

/**
@function deleteFilter

@description
The deleteFilter function deletes the filter in the layer.filter.current object. And applies the changes to the layer.

@param {layer} layer The layer to reload.
@property {Object} layer.filter The filter thats active on the layer.
@param {Object} filter The filter definition.
@property {Object} filter.field The field the filter works on.
@property {String} filter.type The filters' type e.g like, in, etc.
*/
function deleteFilter(layer, filter) {
  if (layer.filter.current[filter.field]) {
    if (Object.hasOwn(layer.filter.current[filter.field], filter.type)) {
      // Delete type property from filter
      delete layer.filter.current[filter.field][filter.type];
    }

    if (Object.hasOwn(layer.filter.current, filter.field)) {
      // Delete [filter] field property.
      delete layer.filter.current[filter.field];
    }

    // Delete [filter] min if not fixed as Min.
    if (isNaN(filter.Min)) {
      delete filter.min;
    }

    // Delete [filter] max if not fixed as Max.
    if (isNaN(filter.Max)) {
      delete filter.max;
    }
  }

  mapp.ui.layers.filters.applyFilter(layer);
}

/**
@function removeFilter

@description
The removeFilter function removes the selected filter from the panel.
Calls {@link module:/ui/layers/filters~applyFilter} once the card has been removed to update the layer.

Hides the clearAll and resetAll button if they are no more cards in the panel.

@param {layer} layer The layer to reload.
@param {Object} filter The filter definition.
@property {HTMLElement} [filter.card] The html element of the filter.
@property {HTMLElement} [filter.li] The list element if applicable.
*/
function removeFilter(layer, filter) {
  deleteFilter(layer, filter);

  filter.li?.classList.remove('selected');

  filter.card?.remove();

  filter.histogram?.removeChangeEnd?.();
  // remove selected flag to allow for selection in dropdown element.
  delete filter.selected;

  delete filter.card;

  if (!layer.filter.list?.some((filter) => filter.card)) {
    layer.filter.clearAll instanceof HTMLElement &&
      layer.filter.clearAll.style.setProperty('display', 'none');
    layer.filter.resetAll instanceof HTMLElement &&
      layer.filter.resetAll.style.setProperty('display', 'none');
    layer.filter.feature_count instanceof HTMLElement &&
      layer.filter.feature_count.style.setProperty('display', 'none');
  }
}

/**
@function resetFilter

@description
The resetFilter method deletes the filter and replaces the filter.card with a new card with initial filter config.

@param {layer} layer The layer to reload.
@param {Object} filter The filter definition.
@property {HTMLElement} filter.card The html element of the filter.
*/
async function resetFilter(layer, filter) {
  deleteFilter(layer, filter);

  // Get interface content for filter card.
  if (!filter.card) return;

  filter.content = [
    await mapp.ui.layers.filters[filter.type](layer, filter),
  ].flat();

  const newCard = mapp.ui.elements.card(filter);

  filter.card.replaceWith(newCard);

  filter.card = newCard;
}

/**
@function filter_text
@description Creates an input element for filtering text values.
@param {Object} layer - The layer object to apply the filter to.
@param {Object} filter - The filter configuration object.
@returns {HTMLElement} The input element for text filtering.
*/
function filter_text(layer, filter) {
  return mapp.utils.html.node`
  <input
    type="text"
    onkeyup=${(e) => {
      if (!e.target.value.length) {
        // Delete filter for empty input.
        delete layer.filter.current[filter.field];
      } else {
        layer.filter.current[filter.field] ??= {};
        layer.filter.current[filter.field][filter.type] = encodeURIComponent(
          `${(filter.leading_wildcard && '%') || ''}${e.target.value}`,
        );
      }
      filterMethods.applyFilter(layer);
    }}>`;
}

/**
@function filter_boolean
@description Creates a checkbox element for filtering boolean values.
@param {Object} layer - The layer object to apply the filter to.
@param {Object} filter - The filter configuration object.
@returns {HTMLElement} The checkbox element for boolean filtering.
*/
function filter_boolean(layer, filter) {
  function booleanFilter(checked) {
    layer.filter.current[filter.field] = {
      boolean: checked,
    };
    filterMethods.applyFilter(layer);
  }

  booleanFilter(false);

  return mapp.ui.elements.chkbox({
    label: filter.label || filter.title || 'chkbox',
    onchange: booleanFilter,
  });
}

/**
@function filter_null
@description Creates a checkbox element for filtering null values.
@param {Object} layer - The layer object to apply the filter to.
@param {Object} filter - The filter configuration object.
@returns {HTMLElement} The checkbox element for null filtering.
*/
function filter_null(layer, filter) {
  function nullFilter(checked) {
    layer.filter.current[filter.field] = {
      null: checked,
    };
    filterMethods.applyFilter(layer);
  }

  nullFilter(false);

  return mapp.ui.elements.chkbox({
    label: filter.label || filter.title || 'chkbox',
    onchange: nullFilter,
  });
}

/**
@function generateMinMax
@description
Query the min and max values for a numeric filter field.

@param {layer} layer MAPP layer typedef object.
@param {Object} filter Filter object.
@property {string} filter.field Field to filter.
@property {numeric} [filter.min] Min bounds.
@property {numeric} [filter.max] Max bounds.
@property {string} [filter.minmax_query] Query template for min max values.
*/
async function generateMinMax(layer, filter) {
  const queryParams = mapp.utils.queryParams({
    layer: layer,
    queryparams: {
      table: true,
      template: 'field_minmax',
      field: filter.field,
    },
    viewport: layer.filter.viewport,
  });

  queryParams.filter = structuredClone(layer.filter.current);

  // The filter field itself must be removed from the queryParams filter as otherwise the result would never increase.
  delete queryParams.filter[filter.field];

  const paramString = mapp.utils.paramString(queryParams);

  const response = await mapp.utils.xhr(
    `${layer.mapview.host}/api/query?${paramString}`,
  );

  // Assign min, max from response if not a number.
  let min = isNaN(filter.min) ? response.minmax[0] : filter.min;
  let max = isNaN(filter.max) ? response.minmax[1] : filter.max;

  // overwrite min max from response if viewport is applied
  if (layer.filter?.viewport) {
    min = response.minmax[0];
    max = response.minmax[1];
  }

  // Parse min, max as interger or float depending on type.
  // Round integer to be correct up or down.
  filter.min = filter.type === 'integer' ? Math.round(min) : parseFloat(min);
  filter.max = filter.type === 'integer' ? Math.round(max) : parseFloat(max);

  filter.min = filter.val_a < filter.min ? filter.val_a : filter.min;
  filter.max = filter.val_b > filter.max ? filter.val_b : filter.max;
}

/**
@function filter_numeric

@description
Returns numeric inputs and range slider element as UI for numeric layer filter.

Numeric layer filter are a combination of an LTE (less-than-[or]equal) and GTE (greater-than-[or]equal) filter for a field defined in a matching entry field.

@param {layer} layer MAPP layer typedef object.
@param {Object} filter Filter object.
@property {string} filter.field Field to filter.
@property {numeric} [filter.min] Min bounds.
@property {numeric} [filter.max] Max bounds.
@property {numeric} [filter.step] Step for renage slider.

@returns {Promise<HTMLElement>}
The filter UI elements.
*/

async function filter_numeric(layer, filter) {
  // Find infoj entry and merge into the filter object.
  const entry = layer.infoj.find((entry) => entry.field === filter.field);

  Object.assign(filter, entry);

  delete filter.val_a;
  delete filter.val_b;

  // Fix min and max as Min and Max if [finite] number.
  filter.Min ??= Number.isFinite(filter.min) ? filter.min : undefined;
  filter.Max ??= Number.isFinite(filter.max) ? filter.max : undefined;

  if (isNaN(filter.max) || isNaN(filter.min)) {
    // Query min and max if not implicit.
    await generateMinMax(layer, filter);
  }

  filter.step ??= filter.type === 'integer' ? 1 : 0.01;

  // Assign the range min / max as layer filter if not already defined.
  layer.filter.current[filter.field] = Object.assign(
    {
      gte: Number(filter.min),
      lte: Number(filter.max),
    },
    layer.filter.current[filter.field],
  );

  filterMethods.applyFilter(layer);

  // Only if filter.min and filter.max are not numeric values, return a message.
  if (isNaN(filter.min) || isNaN(filter.max)) {
    // Return text to indicate that the min and max values are not defined.
    return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`;
  }

  // Create affix for rangeslider input label.
  const affix =
    filter.prefix || filter.suffix
      ? `(${(filter.prefix || filter.suffix).trim()})`
      : '';

  filter.label_a ??= `${mapp.dictionary.layer_filter_greater_than} ${affix}`;

  filter.label_b ??= `${mapp.dictionary.layer_filter_less_than} ${affix}`;

  filter.val_a = layer.filter.current?.[filter.field]?.gte;

  filter.val_b = layer.filter.current?.[filter.field]?.lte;

  filter.callback_a = (val) => {
    layer.filter.current[filter.field].gte = val;
    filter.val_a = Number(val);
    filterMethods.applyFilter(layer);
  };

  filter.callback_b = (val) => {
    layer.filter.current[filter.field].lte = val;
    filter.val_b = Number(val);
    filterMethods.applyFilter(layer);
  };

  filter.slider = mapp.ui.elements.slider_ab(filter);

  await histogram(filter, layer);

  const node = mapp.utils.html`
    ${filter.histogram?.container}
    ${filter.slider}`;

  return node;
}

/**
@function histogram
@description
Creates a histogram element based on configuration in the numeric filter object.
@param {Object} filter Filter object.
@param {layer} layer MAPP layer on which the filter is applied.
@property {Object} [filter.histogram] Configuration object for a histogram dataview.
*/
async function histogram(filter, layer) {
  if (!filter.histogram) return;

  if (filter.histogram === true) {
    // If histogram is set to true, make histogram an object.
    filter.histogram = {};
  }

  filter.histogram.container ??= mapp.utils.html.node`<div>`;
  filter.histogram.dataview ??= 'histogram';
  filter.histogram.options ??= {
    tooltip: true,
  };
  filter.histogram.target ??= filter.histogram.container;
  filter.histogram.layer ??= layer;

  filter.histogram.queryparams ??= {
    field: filter.field,
    table: true,
    filter: true,
  };

  filter.histogram.viewport ??= layer.filter.viewport;

  if (!filter.histogram.update) {
    await mapp.ui.Dataview(filter.histogram);
  }

  if (filter.histogram.viewport) {
    layer.mapview.Map.getTargetElement().addEventListener(
      'changeEnd',
      changeEnd,
    );

    filter.histogram.removeChangeEnd = () => {
      layer.mapview.Map.getTargetElement().removeEventListener(
        'changeEnd',
        changeEnd,
      );
    };

    function changeEnd() {
      filter.histogram.update();
    }
  }
}

/**
@function filter_in

@description
Filter interface elements for `in` and `ni` type layer filter are returned from the filter_in() method.

The method is async to wait for a distinct values query to populate the filter type [eg. in or ni] values array.

A list of checkbox elements will be returned as default interface without a `dropdown`, `dropdown_pills`, or `searchbox` flag.

@param {Object} layer Decorated MAPP Layer Object.
@param {Object} filter The filter object.
@param {string} filter.field The filter field.
@property {Array} [filter.in] Array of values for in type filter.
@property {Array} [filter.ni] Array of values for ni type filter.
@property {Boolean} [filter.dropdown] Create dropdown [pills] filter interface.
@property {Boolean} [filter.dropdown_pills] Create dropdown [pills] filter interface.
@property {Boolean} [filter.searchbox] Create searchbox [pills] filter interface.
@returns {Promise<HTMLElement>} Filter interface elements.
*/
async function filter_in(layer, filter) {
  // Check whether a filter type values array has been provided.
  if (!Array.isArray(filter[filter.type])) {
    const filter_current = structuredClone(layer.filter?.current);

    // The distinct_values query should not be filtered on the field.
    delete filter_current?.[filter.field];

    // Query distinct field values from the layer table.
    const response = await mapp.utils.xhr(
      `${layer.mapview.host}/api/query?` +
        mapp.utils.paramString({
          field: filter.field,
          filter: filter_current,
          layer: layer.key,
          locale: layer.mapview.locale.key,
          table: layer.tableCurrent(),
          template: 'distinct_values',
        }),
    );

    if (!response) {
      console.warn(
        `Distinct values query did not return any values for field ${filter.field}`,
      );

      // Set a div with a message that the field contains no data.
      return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`;
    }

    filter[filter.type] = [response]

      // Flatten response in array to account for the response being a single record and not an array.
      .flat()

      // Map the entry field from response records.
      .map((record) => record[filter.field])

      // Filter out null values.
      .filter((val) => val !== null);
  }

  // Create set to check for current values in the filter array.
  const chkSet = new Set(
    layer.filter?.current[filter.field]?.[filter.type] || [],
  );

  if (filter.dropdown || filter.dropdown_pills || filter.dropdown_search) {
    const dropdown = mapp.ui.elements.dropdown({
      callback: async (e, options) => {
        if (!options.length) {
          // Remove empty array filter.
          delete layer.filter.current[filter.field];
        } else {
          // Set filter values array from options.
          Object.assign(layer.filter.current, {
            [filter.field]: {
              [filter.type]: options,
            },
          });
        }

        filterMethods.applyFilter(layer);
      },
      field: filter.field,
      search: filter.dropdown_search,
      entries: filter[filter.type].map((val) => ({
        option: val,
        selected: chkSet.has(val),
        title: val,
      })),
      inputfilter: true,
      keepPlaceholder: filter.dropdown_pills,
      maxHeight: 300,
      multi: true,
      pills: filter.dropdown_pills,
      placeholder:
        filter.placeholder || mapp.dictionary.layer_filter_dropdown_select,
    });

    return mapp.utils.html.node`<div class="filter">${dropdown}`;
  }

  if (filter.searchbox) {
    const searchbox_filter = mapp.utils.html.node`<div class="filter">`;

    const pillComponent = mapp.ui.elements.pills({
      addCallback: (val, pills) => {
        Object.assign(layer.filter.current, {
          [filter.field]: {
            [filter.type]: [...pills],
          },
        });
        filterMethods.applyFilter(layer);
      },
      removeCallback: (val, pills) => {
        if (pills.size === 0) {
          searchbox.input.value = null;

          //if nothing left selected delete the entire filter
          delete layer.filter.current[filter.field];
        } else {
          Object.assign(layer.filter.current, {
            [filter.field]: {
              [filter.type]: [...pills],
            },
          });
        }

        filterMethods.applyFilter(layer);
      },
      target: searchbox_filter,
    });

    const searchbox = mapp.ui.elements.searchbox({
      placeholder: mapp.dictionary.filter_searchbox_placeholder,
      searchFunction: (e) => {
        searchbox.list.innerHTML = '';

        if (!e.target.value) return; // nothing to match

        const pattern = e.target.value;

        const filtered = filter[filter.type].filter((val) =>
          // val may not be string.
          val
            .toString()
            .toLowerCase()
            .startsWith(pattern.toLowerCase()),
        );

        if (!filtered.length) {
          searchbox.list.append(mapp.utils.html.node`
            <li><span>${mapp.dictionary.no_results}`);

          return;
        }

        filtered
          .filter((val) => !pillComponent.pills.has(val)) // only those not selected already
          .filter((val, i) => i < 9)
          .forEach((val) => {
            // Append li element to searchbox.list
            searchbox.list.append(mapp.utils.html.node`
              <li onclick=${() => {
                // Add pill not yet in pillComponent
                !pillComponent.pills.has(val) && pillComponent.add(val);
              }}>${val}`);
          });
      },
      target: searchbox_filter,
    });

    return mapp.utils.html.node`${searchbox_filter}`;
  }

  const chkBoxes = filter[filter.type].map((val) =>
    mapp.ui.elements.chkbox({
      checked: chkSet.has(val),
      label: val,
      onchange: (checked, val) => {
        if (checked) {
          // Create filter object if it doesn't exist.
          if (!layer.filter.current[filter.field]) {
            layer.filter.current[filter.field] = {};
          }

          // Create empty in array if it doesn't exist.
          if (!layer.filter.current[filter.field][filter.type]) {
            layer.filter.current[filter.field][filter.type] = [];
          }

          // Add value to filter array.
          layer.filter.current[filter.field][filter.type].push(val);
        } else {
          // Get index of value in filter array.
          const idx =
            layer.filter.current[filter.field][filter.type].indexOf(val);

          // Splice filter array on idx.
          layer.filter.current[filter.field][filter.type].splice(idx, 1);

          // Remove filter object if it is empty.
          if (!layer.filter.current[filter.field][filter.type].length) {
            delete layer.filter.current[filter.field];
          }
        }

        filterMethods.applyFilter(layer);
      },
      val: val,
    }),
  );

  return mapp.utils.html.node`<div class="filter">${chkBoxes}`;
}

/**
@function filter_date
@description Creates input elements for filtering date values.
@param {Object} layer - The layer object to apply the filter to.
@param {Object} filter - The filter configuration object.
@returns {HTMLElement} The input elements for date filtering.
*/
function filter_date(layer, filter) {
  const inputAfter = mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${onClose}
      type=${(filter.type === 'datetime' && 'datetime-local') || 'date'}>`;

  const inputBefore = mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${onClose}
      type=${(filter.type === 'datetime' && 'datetime-local') || 'date'}>`;

  function onClose(e) {
    if (e.target.dataset.id === 'inputAfter') {
      layer.filter.current[filter.field] = Object.assign(
        layer.filter.current[filter.field] || {},
        {
          gt: new Date(e.target.value).getTime() / 1000,
        },
      );
    }

    if (e.target.dataset.id === 'inputBefore') {
      layer.filter.current[filter.field] = Object.assign(
        layer.filter.current[filter.field] || {},
        {
          lt: new Date(e.target.value).getTime() / 1000,
        },
      );
    }

    filterMethods.applyFilter(layer);
  }

  return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${inputAfter}</label>
      <label>Date before
        ${inputBefore}</label>`;
}
