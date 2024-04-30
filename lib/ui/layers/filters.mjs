/**
## mapp.ui.layers.filters[type](layer, filter)

Provides filter functions for various data types in a layer.

@module /ui/layers/filters
*/

export default {
  like: filter_text,
  match: filter_text,
  numeric: filter_numeric,
  integer: filter_numeric,
  in: filter_in,
  ni: filter_in,
  date: filter_date,
  datetime: filter_date,
  boolean: filter_boolean,
  null: filter_null,
}

let timeout;

mapp.utils.merge(mapp.dictionaries, {
  en: {
    no_data_filter: 'This field contains no data and cannot be filtered on.'
  },
  de: {
    no_data_filter: 'Dieses Feld enthält keine Daten und kann nicht gefiltert werden.'
  }
});

/**
 * @function applyFilter
 * @description Applies the filter to the layer and reloads it with a debounce of 500ms.
 * @param {Object} layer - The layer object to apply the filter to.
 */
function applyFilter(layer) {

  clearTimeout(timeout);

  // Debounce layer reload by 500
  timeout = setTimeout(() => {
    if (layer.style.legend) {
      mapp.ui.layers.legends[layer.style.theme.type](layer)
    }
    layer.reload();
    layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
  }, 500);
}

/**
 * @function filter_text
 * @description Creates an input element for filtering text values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The input element for text filtering.
 */
function filter_text(layer, filter) {
  return mapp.utils.html.node`
  <input
    type="text"
    onkeyup=${(e) => {
      if (!e.target.value.length) {

        // Delete filter for empty input.
        delete layer.filter.current[filter.field][filter.type]

        if (!Object.keys(layer.filter.current[filter.field])) {
          delete layer.filter.current[filter.field]
        }

      } else {

        layer.filter.current[filter.field] ??= {}
        layer.filter.current[filter.field][filter.type] = encodeURIComponent(`${filter.leading_wildcard && '%' || ''}${e.target.value}`)
      }
      applyFilter(layer)
    }}>`;
}

/**
 * @function filter_boolean
 * @description Creates a checkbox element for filtering boolean values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The checkbox element for boolean filtering.
 */
function filter_boolean(layer, filter) {

  function booleanFilter(checked) {
    layer.filter.current[filter.field] = {
      boolean: checked
    }
    applyFilter(layer)
  }

  booleanFilter(false)

  return mapp.ui.elements.chkbox({
    label: filter.label || filter.title || 'chkbox',
    onchange: booleanFilter
  })
}

/**
 * @function filter_null
 * @description Creates a checkbox element for filtering null values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The checkbox element for null filtering.
 */
function filter_null(layer, filter) {

  function nullFilter(checked) {
    layer.filter.current[filter.field] = {
      null: checked
    }
    applyFilter(layer)
  }

  nullFilter(false)

  return mapp.ui.elements.chkbox({
    label: filter.label || filter.title || 'chkbox',
    onchange: nullFilter
  })
}

/**
 * @function generateMinMax
 * @description Generates the minimum and maximum values for numeric filtering.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @param {string} minmax - The type of value to generate ('min' or 'max').
 * @returns {Promise<void>}
 */
async function generateMinMax(layer, filter, minmax) {
  let response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${mapp.utils.paramString({
    template: `field_${minmax}`,
    locale: layer.mapview.locale.key,
    layer: layer.key,
    table: layer.tableCurrent(),
    field: filter.field,
  })}`);

  // If the response contains response.min or response.max - we can assume the query was successful.
  // Have to check that response is not null as well
  response ??= {}
  if (response[minmax]) {
    filter[minmax] = filter.type === 'integer' ? Math.round(response[minmax]) : parseFloat(response[minmax]);
  }

}

/**
 * @function filter_numeric
 * @description Creates a slider element for filtering numeric values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {Promise<HTMLElement>} The slider element for numeric filtering.
 */
async function filter_numeric(layer, filter) {

  if (!filter.max) {

    await generateMinMax(layer, filter, 'max');
  }  
  
if (!filter.min) {

    await generateMinMax(layer, filter, 'min');
  }
  
  if (!filter.step) {

    filter.step = filter.type === 'integer' ? 1 : 0.01;
  }

  layer.filter.current[filter.field] = Object.assign(
    {
      gte: Number(filter.min),
      lte: Number(filter.max)
    },
    layer.filter.current[filter.field]);

  const entry = layer.infoj.find(entry => entry.field === filter.field)
  entry.formatter ??= entry.formatterParams
  let affix = entry.prefix || entry.suffix
  affix = affix ? `(${affix.trim()})` : ''
  entry.filterInput = true
  applyFilter(layer);

  // Only if filter.min and filter.max are not numeric values, return a message.
  if (isNaN(filter.min) || isNaN(filter.max)) {
    // Return text to indicate that the min and max values are not defined.
    return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`
  };

  return mapp.ui.elements.slider_ab({
    min: Number(filter.min),
    max: Number(filter.max),
    step: filter.step,
    entry: entry,
    label_a: `${mapp.dictionary.layer_filter_greater_than} ${affix}`, // Greater than
    val_a: mapp.ui.elements.numericFormatter(entry, filter.min),
    slider_a: Number(filter.min),
    callback_a: e => {
      layer.filter.current[filter.field].gte = Number(e)
      applyFilter(layer)
    },
    label_b: `${mapp.dictionary.layer_filter_less_than}  ${affix}`, // Less than
    val_b: mapp.ui.elements.numericFormatter(entry, filter.max),
    slider_b: Number(filter.max),
    callback_b: e => {
      layer.filter.current[filter.field].lte = Number(e)
      applyFilter(layer)
    }

  })

}


/**
 * @function filter_in
 * @description Creates checkbox or dropdown elements for filtering values in a list.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {Promise<HTMLElement>} The checkbox or dropdown elements for list filtering.
 */
async function filter_in(layer, filter) {

  if (!Array.isArray(filter[filter.type])) {

    // Query distinct field values from the layer table.
    const response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'distinct_values',
        dbs: layer.dbs,
        locale: layer.mapview.locale.key,
        layer: layer.key,
        table: layer.tableCurrent(),
        field: filter.field
      }))

    if (!response) {
      console.warn(`Distinct values query did not return any values for field ${filter.field}`)
      return;
    }

    filter[filter.type] = [response]

      // Flatten response in array to account for the response being a single record and not an array.
      .flat()

      // Map the entry field from response records.
      .map(record => record[filter.field])

      // Filter out null values.
      .filter(val => val !== null)
  }

  const chkSet = new Set(layer.filter?.current[filter.field]?.[filter.type] || []);

  if (filter.dropdown) {

    const dropdown = mapp.ui.elements.dropdown({
      multi: true,
      placeholder: 'Select Multiple',
      entries: filter[filter.type].map(val => ({
        title: val,
        option: val,
        selected: chkSet.has(val)
      })),
      callback: async (e, options) => {

        if (!options.length) {

          // Remove empty array filter.
          delete layer.filter.current[filter.field]
        } else {

          // Set filter values array from options.
          Object.assign(layer.filter.current, {
            [filter.field]: {
              [filter.type]: options
            }
          })
        }

        applyFilter(layer)
      }
    })

    return mapp.utils.html.node`<div class="filter">${dropdown}`
  }

  const chkBoxes = filter[filter.type].map(val => mapp.ui.elements.chkbox({
    val: val,
    label: val,
    checked: chkSet.has(val),
    onchange: (checked, val) => {

      if (checked) {

        // Create filter object if it doesn't exist.
        if (!layer.filter.current[filter.field]) {
          layer.filter.current[filter.field] = {}
        }

        // Create empty in array if it doesn't exist.
        if (!layer.filter.current[filter.field][filter.type]) {
          layer.filter.current[filter.field][filter.type] = []
        }

        // Add value to filter array.
        layer.filter.current[filter.field][filter.type].push(val);

      } else {

        // Get index of value in filter array.
        const idx = layer.filter.current[filter.field][filter.type].indexOf(val);

        // Splice filter array on idx.
        layer.filter.current[filter.field][filter.type].splice(idx, 1);

        // Remove filter object if it is empty.
        if (!layer.filter.current[filter.field][filter.type].length) {
          delete layer.filter.current[filter.field]
        }

      }

      applyFilter(layer)
    }
  }))

  return mapp.utils.html.node`<div class="filter">${chkBoxes}`
}

/**
 * @function filter_date
 * @description Creates input elements for filtering date values.
 * @param {Object} layer - The layer object to apply the filter to.
 * @param {Object} filter - The filter configuration object.
 * @returns {HTMLElement} The input elements for date filtering.
 */
function filter_date(layer, filter) {

  const inputAfter = mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${onClose}
      type=${filter.type === 'datetime' && 'datetime-local' || 'date'}>`;

  const inputBefore = mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${onClose}
      type=${filter.type === 'datetime' && 'datetime-local' || 'date'}>`;

  function onClose(e) {

    if (e.target.dataset.id === 'inputAfter') {

      layer.filter.current[filter.field] = Object.assign(
        layer.filter.current[filter.field] || {},
        {
          gt: new Date(e.target.value).getTime() / 1000
        })

    }

    if (e.target.dataset.id === 'inputBefore') {

      layer.filter.current[filter.field] = Object.assign(
        layer.filter.current[filter.field] || {},
        {
          lt: new Date(e.target.value).getTime() / 1000
        })

    }

    applyFilter(layer)
  }

  return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${inputAfter}</label>
      <label>Date before
        ${inputBefore}</label>`

}