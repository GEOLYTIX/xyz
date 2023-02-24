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

function applyFilter(layer, zoom) {
  clearTimeout(timeout);

  // enable zoomToExtent button.
  let btn = layer.view.querySelector('[data-id=zoomToExtent]')
  if (btn) btn.disabled = false;

  // Debounce layer reload by 500
  timeout = setTimeout(() => {
    timeout = null;
    layer.reload();
    layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
  }, 500);
}

function filter_text(layer, entry){
  return mapp.utils.html.node`
  <input
    type="text"
    onkeyup=${(e) => {
      if (!e.target.value.length) {

        // Delete filter for empty input.
        delete layer.filter.current[entry.filter.field]
      } else {
        layer.filter.current[entry.filter.field] = {
          [entry.filter.type]: encodeURIComponent(`${entry.filter.leading_wildcard && '%' || ''}${e.target.value}`)
        }
      }
      applyFilter(layer)
    }}>`;
}

function filter_boolean(layer, entry) {

  function booleanFilter(checked) {
    layer.filter.current[entry.filter.field] = {
      boolean: checked
    }
    layer.reload();
    layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
  }

  booleanFilter(false)

  return mapp.ui.elements.chkbox({
    label: entry.label || entry.title || 'chkbox',
    onchange: booleanFilter
  })
}

function filter_null(layer, entry) {

  function nullFilter(checked) {
    layer.filter.current[entry.filter.field] = {
      null: checked
    }
    layer.reload();
    layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
  }

  nullFilter(false)

  return mapp.ui.elements.chkbox({
    label: entry.label || entry.title || 'chkbox',
    onchange: nullFilter
  })
}

async function filter_numeric(layer, entry){

  if (!entry.filter.max) {

    let response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'field_max',
      locale: layer.mapview.locale.key,
      layer: layer.key,
      table: layer.tableCurrent(),
      field: entry.field,
    })}`);

    entry.filter.max = response.max
  }

  if (!entry.filter.min) {

    let response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${mapp.utils.paramString({
      template: 'field_min',
      locale: layer.mapview.locale.key,
      layer: layer.key,
      table: layer.tableCurrent(),
      field: entry.field,
    })}`);

    entry.filter.min = response.min
  }

  if (!entry.filter.step) {

    entry.filter.step = entry.filter.type === 'integer' ? 1 : 0.01;
  }


  layer.filter.current[entry.field] = Object.assign(
    {
      gte: Number(entry.filter.min),
      lte: Number(entry.filter.max)
    },
    layer.filter.current[entry.field]);

  applyFilter(layer);

  return mapp.ui.elements.slider_ab({
    min: Number(entry.filter.min),
    max: Number(entry.filter.max),
    step: entry.filter.step,
    label_a: 'Greater than',
    val_a: Number(entry.filter.min),
    callback_a: e => {
      layer.filter.current[entry.field].gte = Number(e.target.value)
      applyFilter(layer)
    },
    label_b: 'Lesser than',
    val_b: Number(entry.filter.max),
    callback_b: e => {
      layer.filter.current[entry.field].lte = Number(e.target.value)
      applyFilter(layer)
    }

  })

}

async function filter_in(layer, entry) {

  if (entry.filter.distinct) {

    // Query distinct field values from the layer table.
    const response = await mapp.utils.xhr(`${layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'distinct_values',
        dbs: layer.dbs,
        table: layer.tableCurrent(),
        field: entry.field
      }))

    entry.filter[entry.filter.type] = [response]

      // Flatten response in array to account for the response being a single record and not an array.
      .flat()

      // Map the entry field from response records.
      .map(record => record[entry.field])

      // Filter out null values.
      .filter(val => val !== null)
  }

  const chkSet = new Set(layer.filter?.current[entry.filter.field]?.[entry.filter.type] || []);

  if (entry.filter.dropdown) {

    return mapp.ui.elements.dropdown({
      multi: true,
      placeholder: 'Select Multiple',
      entries: entry.filter[entry.filter.type].map(val => ({
        title: decodeURIComponent(val),
        option: encodeURIComponent(val),
        selected: chkSet.has(val)
      })),
      callback: async (e, options) => {

        Object.assign(layer.filter.current, {
          [entry.filter.field]:{
            [entry.filter.type]: options
          }
        })
        layer.reload()
        layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
      }
    })
  }

  return entry.filter[entry.filter.type].map(val => mapp.ui.elements.chkbox({
    val: encodeURIComponent(val),
    label: decodeURIComponent(val),
    checked: chkSet.has(val),
    onchange: (checked, val) => {
  
      if (checked) {
  
        // Create filter object if it doesn't exist.
        if (!layer.filter.current[entry.filter.field]) {
          layer.filter.current[entry.filter.field] = {}
        }
  
        // Create empty in array if it doesn't exist.
        if (!layer.filter.current[entry.filter.field][entry.filter.type]) {
          layer.filter.current[entry.filter.field][entry.filter.type] = []
        }
  
        // Add value to filter array.
        layer.filter.current[entry.filter.field][entry.filter.type].push(val);
                  
      } else {
  
        // Get index of value in filter array.
        const idx = layer.filter.current[entry.filter.field][entry.filter.type].indexOf(val);
  
        // Splice filter array on idx.
        layer.filter.current[entry.filter.field][entry.filter.type].splice(idx, 1);
  
        // Remove filter object if it is empty.
        if (!layer.filter.current[entry.filter.field][entry.filter.type].length) {
          delete layer.filter.current[entry.filter.field][entry.filter.type]
        }
  
      }
  
      layer.reload()
      layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
  
    }
  }))
}

function filter_date(layer, entry) {

  const inputAfter = mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${onClose}
      type=${entry.type === 'datetime' && 'datetime-local' || 'date'}>`;

  const inputBefore = mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${onClose}
      type=${entry.type === 'datetime' && 'datetime-local' || 'date'}>`;

  function onClose(e) {

    if (e.target.dataset.id === 'inputAfter') {

      layer.filter.current[entry.field] = Object.assign(
        layer.filter.current[entry.field] || {},
        {
          gt: new Date(e.target.value).getTime() / 1000
        })
      
    }

    if (e.target.dataset.id === 'inputBefore') {

      layer.filter.current[entry.field] = Object.assign(
        layer.filter.current[entry.field] || {},
        {
          lt: new Date(e.target.value).getTime() / 1000
        })
      
    }

    layer.reload();
    layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
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