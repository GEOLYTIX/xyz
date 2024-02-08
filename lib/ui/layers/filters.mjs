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

function filter_text(layer, filter){
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

async function filter_numeric(layer, filter){

  if (!filter.max) {

    let response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'field_max',
      locale: layer.mapview.locale.key,
      layer: layer.key,
      table: layer.tableCurrent(),
      field: filter.field,
    })}`);

    filter.max = filter.type === 'integer' ? parseInt(response.max) : parseFloat(response.max);
  }

  if (!filter.min) {

    let response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'field_min',
      locale: layer.mapview.locale.key,
      layer: layer.key,
      table: layer.tableCurrent(),
      field: filter.field,
    })}`);

    filter.min = filter.type === 'integer' ? parseInt(response.min) : parseFloat(response.min);
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

  applyFilter(layer);

  return mapp.ui.elements.slider_ab({
    min: Number(filter.min),
    max: Number(filter.max),
    step: filter.step,
    label_a: mapp.dictionary.layer_filter_greater_than, // Greater than
    val_a: Number(filter.min),
    callback_a: e => {
      layer.filter.current[filter.field].gte = Number(e.target.value)
      applyFilter(layer)
    },
    label_b: mapp.dictionary.layer_filter_less_than, // Less than
    val_b: Number(filter.max),
    callback_b: e => {
      layer.filter.current[filter.field].lte = Number(e.target.value)
      applyFilter(layer)
    }

  })

}

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
            [filter.field]:{
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