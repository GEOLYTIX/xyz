export default {
  create,
  setData,
  events,
  headerFilter: {
    like,
    numeric,
    set,
    date: dateFilter
  },
  formatter: {
    toLocaleString,
    date
  },
  select,
  columns,
  toolbar: {
    download_csv,
    clear_table_filters,
    download_json,
    viewport,
    layerfilter
  }
};

mapp.utils.merge(mapp.dictionaries, {
  en: {
    fail_tabulator_load: 'Failed to load Tabulator library. Please reload the browser.',
    download_csv: 'Download as CSV',
  },
  de: {
    fail_tabulator_load: 'Laden des Tabulator Modules fehlgeschlagen.'
  },
  zh: {
    fail_tabulator_load: '无法加载制表符库。 请重新加载浏览器。'
  },
  zh_tw: {
    fail_tabulator_load: '無法載入定位字元庫。 請重新載入流覽器。'
  },
  pl: {
    fail_tabulator_load: 'Nie udało się załadować biblioteki Tabulator. Otwórz ponownie przeglądarkę.',
    download_csv: 'Pobierz jako CSV'
  },
  fr: {
    fail_tabulator_load: 'Erreur de chargement de la librairie Tabulator. Veuillez actualiser la page.'
  },
  ja: {
    fail_tabulator_load: 'Tabulatorライブラリはロードに失敗しました。ブラウザをリロードしてください.'
  },
  es: {
    fail_tabulator_load: 'No se pudo cargar la biblioteca Tabulator. Por favor actualice la página.'
  },
  tr: {
    fail_tabulator_load: 'Tabulator kutuphanesi yuklenemedi. Lutfen sayfayi yenileyiniz.'
  },
  it: {
    fail_tabulator_load: 'Errore nel caricare la libreria Tabulator. Per favore ricarica il browser'
  },
  th: {
    fail_tabulator_load: 'ไม่สามารถโหลดไลบรารีแบบตารางได้ กรุณาโหลดเบราว์เซอร์อีกครั้ง'
  }
});

let promise, Tabulator = null;

async function tabulator() {

  // Create promise to load Tabulator library if null.
  promise ??= new Promise(resolve => {

    // Assign from window if Tabulator library is loaded from link
    if (window.Tabulator) {

      Tabulator = window.Tabulator

      resolve()

      return
    }

    // Append the tabulator css to the document head.
    document.getElementsByTagName('HEAD')[0].append(mapp.utils.html.node`
      <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css"/>`);

    // Import Chart and plugins.
    Promise
      .all([
        import('https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator_esm.min.js')
      ])
      .then(imports => {

        Tabulator = imports[0].TabulatorFull

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert(`${mapp.dictionary.fail_tabulator_load}`)
      })

  })

  await promise

  // Built Tabulator instance
  const Table = new Tabulator(...arguments);

  // Await for the Tabulator table instance to be built in Promise
  await new Promise(resolve => Table.on('tableBuilt', resolve))

  // Find ul_parents that are positioned fixed in table header.
  const ul_parents = Table.element.querySelectorAll('.ul-parent')

  // Adjust fixed dropdowns on scroll.
  ul_parents.length && Table.on('scrollHorizontal', left => {

    // Get the table element bounds.
    const table_bounds = Table.element.getBoundingClientRect()

    for (const ul_parent of ul_parents) {

      // Get the ul_parent bounds.
      const header_bounds = ul_parent.getBoundingClientRect()

      // Get ul element itself
      const ul = ul_parent.querySelector('ul')

      // The ul may not exist if populated from a query.
      if (ul) {

        // Set fixed element to be the difference of the parent and table bounds on scroll.
        ul.style.left = `${header_bounds.left - table_bounds.left}px`
      }

    }
  });

  // Return built Tabulator instance.
  return Table
}

async function create(_this) {

  // Apply tabulator column methods
  mapp.ui.utils.tabulator.columns(_this)

  // Await initialisation of Tabulator object.
  _this.Tabulator = await tabulator(
    _this.target,
    {
      //renderVertical: 'basic',
      //renderHorizontal: 'virtual',
      selectable: false,
      //data: _this.data,
      ..._this.table
    });

  // Table will not automatically redraw on resize.
  if (_this.table.autoResize === false) {
    let debounce = 0;

    // debounce resizeOberserver by 800.
    _this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        _this.target.offsetHeight > 9 && _this.Tabulator.redraw();
      }, 800);
    });

    _this.resizeObserver.observe(_this.target);
  }

  // Assign tabulator events from object.
  events(_this)

  // Set Tabulator data.
  _this.setData = setData

  // Set _this.data if provided.
  _this.data && _this.setData(_this.data)
}

function events(_this) {

  if (typeof _this.events !== 'object') return;

  Object.entries(_this.events).forEach((event) => {

    // Get event method from tabulator utils.
    if (typeof mapp.ui.utils.tabulator[event[1].util || event[1]] === 'function') {

      _this.Tabulator.on(event[0],
        mapp.ui.utils.tabulator[event[1].util || event[1]](_this, event[1]));
      return;
    }

    // Shortcircuit if events object value is not a function.
    if (typeof event[1] !== 'function') return;

    // Key is event name. Value is the event function.
    _this.Tabulator.on(event[0], event[1]);
  });
};

function setData(data) {

  if (this.noDataMask && !data) {

    this.noDataMask = typeof this.noDataMask === 'string' ? this.noDataMask : 'No Data';

    // Remove display from target
    this.target.style.display = 'none';

    // Create this.mask if undefined.
    this.mask ??= mapp.utils.html.node`<div class="dataview-mask">${this.noDataMask}`

    // Append this.mask to the target parent.
    this.target.parentElement?.append(this.mask)

  } else {

    // Remove this.mask from dom.
    this.mask?.remove();

    // Set dataview target to display as block.
    this.target.style.display = 'block';
  }

  // Set data as empty array if nullish.
  data ??= []

  // Make an array of data if not already an array.
  data &&= Array.isArray(data) ? data : [data];

  // Set data to the tabulator object
  this.Tabulator.setData(data);

  this.data = data;

  // Execute setDataCallback method if defined as function.
  typeof this.setDataCallback === 'function' && this.setDataCallback(_this);

};

function columns(_this) {

  // Check for custom column methods.
  _this.table.columns.forEach((col) => chkCol(col));

  function chkCol(col) {

    // Column is an array of sub columns.
    if (Array.isArray(col.columns)) {

      col.columns.forEach(col => chkCol(col))
      return;
    }

    // Check for custom headerFilter matched in the ui utils.
    if (Object.hasOwn(mapp.ui.utils.tabulator.headerFilter, col.headerFilter)) {

      // Assign custom headerFilter from ui utils.
      col.headerFilter = mapp.ui.utils.tabulator.headerFilter[col.headerFilter](_this)
    }

    // Check for custom formatter in the ui utils.
    if (Object.hasOwn(mapp.ui.utils.tabulator.formatter, col.formatter)) {

      // Assign custom formatter from ui utils.
      col.formatter = mapp.ui.utils.tabulator.formatter[col.formatter](_this);
    }
  }
}

function like(_this) {

  return (cell, onRendered, success, cancel, headerFilterParams) => {

    const field = cell.getColumn().getField()

    function likeFilter(e) {

      // Set layer filter when layerFilter is true and headerFilterParams.layerFilter is true.
      if (headerFilterParams.layerFilter && _this.layerFilter) {

        if (e.target.value.length) {

          // Set filter
          _this.layer.filter.current[field] = {
            [headerFilterParams.type || 'like']: e.target.value
          }

        } else {

          // Remove filter
          delete _this.layer.filter.current[field];
        }

        // Reload layer.
        _this.layer.reload();

        // Reload table.
        _this.update();

        return;
      }

      // Get filter for that field if exists
      const likeFilter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == 'like')

      // Remove existing like filter
      if (likeFilter) {
        _this.Tabulator.removeFilter(...Object.values(likeFilter))

        // Remove layer filter
        headerFilterParams.layerFilter && delete _this.layer.filter.current[field]
      }

      const filters = _this.Tabulator.getFilters()

      if (e.target.value.length) {
        // add like filter to existing filters.
        filters.push({ field: field, type: 'like', value: e.target.value })
        // apply filters to table.
        _this.Tabulator.setFilter(filters);
      }
    }

    return mapp.utils.html.node`<span>
      <input
        type="text"
        placeholder=${mapp.dictionary.layer_filter_header}
        oninput=${likeFilter}
        onblur=${likeFilter}>`

  }
};

function numeric(_this) {

  return (cell, onRendered, success, cancel, headerFilterParams) => {

    // Select the field
    const field = cell.getColumn().getField()

    // Create the minimum input element.
    const inputMin = mapp.utils.html`
  <input
    style="text-align:end"
    type="text" 
    placeholder=${mapp.dictionary.layer_filter_greater_than}
    oninput=${(e) => NumericEvent(e, 'min')}>`;

    // Create the maximum input element.
    const inputMax = mapp.utils.html`
  <input
    style="text-align:end"
    type="text" 
    placeholder=${mapp.dictionary.layer_filter_less_than}
    oninput=${(e) => NumericEvent(e, 'max')}>`;


    // Function to filter the data.
    function NumericEvent(e, type) {

      let formattedValue = e.target.value;

      //Find formatterParams
      const entry = _this.layer.infoj.find(entry => entry.label === _this.label && entry.type === 'dataview')
      const tableField = entry.table.columns.find(column => column.field === field)

      if(tableField.formatter){
        entry.formatter = tableField.formatter
        entry.formatterParams = tableField.formatterParams
        entry.filterInput = true
        const values = getValues(entry)
        formattedValue = values.formatted
        e.target.value = values.numericValue
      }

      function getValues(entry){
        const returnValues = { formatted: e.target.value, numericValue: e.target.value}
        //Get the separators
        const separators = mapp.ui.elements.getSeparators(entry)
        //Ignore empty values or if the user just typed `1.` for example  
        const stringValue = e.target.value.toString()
        if(!e.target.value && type === 'min') return returnValues;
        if(stringValue[0] === '-' && stringValue.length === 1){
          return returnValues;
        } 
        if(tableField.headerFilter === 'numeric' && stringValue.substring(stringValue.indexOf(separators.decimals), stringValue.length) === separators.decimals){
          return returnValues;
        }

        //Get the numeric/integer value.
        entry.value = e.target.value
        const numericValue = mapp.ui.elements.numericFormatter(entry,e.target.value,true)
        //Get the formatted value
        entry.value = numericValue
        const formattedValue = mapp.ui.elements.numericFormatter(entry)

        e.target.value = numericValue
        return { formatted: formattedValue, numericValue: numericValue}
      }

      // If type is min, use >= filter, else use <= filter.
      const filterType = type === 'min' ? '>=' : '<='
      const filterCurrent = type === 'min' ? 'gte' : 'lte'
      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == `${filterType}`)

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layerFilter && delete _this.layer.filter.current[field]
      }

      // Add filter for valid target value.
      if (Number(e.target.value)) {
        _this.Tabulator.addFilter(field, `${filterType}`, Number(e.target.value))

        // Set layer filter when layerFilter is true and headerFilterParams.layerFilter is true.
        if (headerFilterParams.layerFilter && _this.layerFilter) {

          // Assign the filter to the layer filter.
          _this.layer.filter.current[field] = Object.assign(_this.layer.filter.current[field] || {}, { [filterCurrent]: Number(e.target.value) })
          // Reload the layer and update the table.
          _this.layer.reload();
          _this.update();
        }
      }
      formattedValue ??= null
      e.target.value = formattedValue
    }

    // flex container must be encapsulated since tabulator will strip attribute from most senior item returned.
    return mapp.utils.html.node`
      <div><div style="display: flex;">${inputMin}${inputMax}`

  }
}

function dateFilter(_this) {

  return (cell, onRendered, success, cancel, headerFilterParams) => {

    // Select the field
    const field = cell.getColumn().getField()

    // Create the minimum input element.

    const inputMin = mapp.utils.html`
    <input
      type="date"
      onchange=${(e) => DateEvent(e, 'min')}>`;

    // Create the maximum input element.
    const inputMax = mapp.utils.html`
<input
  type="date"
  onchange=${(e) => DateEvent(e, 'max')}>`;

    function DateEvent(e, type) {

      const val = new Date(e.target.value).getTime() / 1000

      // If type is min, use >= filter, else use <= filter.
      const filterType = type === 'min' ? '>=' : '<='
      const filterCurrent = type === 'min' ? 'gte' : 'lte'

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == filterType)

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layerFilter && delete _this.layer.filter.current[field]
      }

      // Add filter for valid target value.
      if (val) {
        _this.Tabulator.addFilter(field, filterType, val)

        // Set layer filter when layerFilter is true and headerFilterParams.layerFilter is true.
        if (headerFilterParams.layerFilter && _this.layerFilter) {
          _this.layer.filter.current[field] = Object.assign(_this.layer.filter.current[field] || {}, { [filterCurrent]: val })
          _this.layer.reload();
          _this.update();
        }
      }
    }

    // flex container must be encapsulated since tabulator will strip attribute from most senior item returned.
    return mapp.utils.html.node`
      <div><div style="display: flex;">${inputMin}${inputMax}`

  }
}

function set(_this) {

  return (cell, onRendered, success, cancel, headerFilterParams) => {

    // Make 'in' the default type for set headerfilter
    headerFilterParams.type = headerFilterParams.type || 'in'

    const field = cell.getColumn().getField()

    // Create dropdown for render.
    let dropdown = mapp.utils.html.node`<div class="ul-parent">`

    if (headerFilterParams.distinct) {

      // Query distinct field values.
      mapp.utils.xhr(`${_this.layer.mapview.host}/api/query?` +
        mapp.utils.paramString({
          template: 'distinct_values',
          dbs: _this.layer.dbs,
          table: _this.layer.tableCurrent(),
          field
        })).then(response => {

          // If response is not an array, make it an array.
          if (!Array.isArray(response)) response = [response];

          // Render dropdown with distinct values from response.
          mapp.utils.render(dropdown, mapp.ui.elements.dropdown({
            multi: true,
            placeholder: headerFilterParams.placeholder || `${mapp.dictionary.layer_filter_set_filter}`,
            entries: response.map(row => ({
              title: row[field],
              option: row[field],
              //selected: chkSet.has(val)
            })),
            callback
          }))
        })

      return dropdown
    }

    mapp.utils.render(dropdown, mapp.ui.elements.dropdown({
      multi: true,
      placeholder: headerFilterParams.placeholder || `${mapp.dictionary.layer_filter_set_filter}`,
      entries: headerFilterParams.options.map(option => ({
        title: option,
        option: option,
        //selected: chkSet.has(val)
      })),
      callback
    }))

    return dropdown

    async function callback(e, options) {

      // Set layer filter when layerFilter is true and headerFilterParams.layerFilter is true.
      if (headerFilterParams.layerFilter && _this.layerFilter) {

        // Create current filter for the layer.
        options.length
          && Object.assign(_this.layer.filter.current, {
            [field]: { [headerFilterParams.type]: options }
          })

          // Delete current filter for field if options is falsy.
          || delete _this.layer.filter.current[field]

        _this.layer.reload()
        _this.update()

        return;
      }

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field)

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layerFilter && delete _this.layer.filter.current[field]
      }

      options.length && _this.Tabulator.addFilter(field, 'in', options)
    }
  }
}

function select(_this, params = {}) {

  return (e, row) => {

    // Get the row data
    const rowData = row.getData();

    const layer = _this.layer?.mapview.layers[params.layer] || _this.layer

    // Return without a layer to select from.
    if (!layer) return;

    // Return without the layer qID in rowData.
    if (!rowData[layer.qID]) return;

    // Get the location using the layer and qID which will select the location in the location panel 
    mapp.location.get({
      layer: layer,
      id: rowData[layer.qID],
    })

      // Zoom to the location if the params flag is set.
      .then(location => {

        // Deselection will return the location as undefined.
        if (!location) return;

        params.zoomToLocation && location.flyTo()
      });

    // Remove selection colour on row element.
    row.deselect();
  }
}

function toLocaleString(_this) {

  return (cell, formatterParams, onRendered) => {

    let val = parseFloat(cell.getValue())

    if (isNaN(val)) return;

    return val.toLocaleString(formatterParams?.locale || navigator.language, formatterParams?.options)
  }
}

function date(_this) {

  return (cell, formatterParams, onRendered) => {

    let val = parseInt(cell.getValue())

    if (isNaN(val)) return;

    let str = new Date(val * 1000).toLocaleString(formatterParams?.locale || navigator.language, formatterParams?.options)

    return str
  }
}

// toolbar elements
function download_csv(_this) {

  return mapp.utils.html`
    <button class="flat"
      onclick=${() => {

      // The data array must have a length
      if (!_this.data.length) return;

      // download_csv is an object with 
      if (_this.toolbar.download_csv instanceof Object) {

        mapp.utils.csvDownload(_this.data, _this.toolbar.download_csv)
        return;
      }

      // Use Tabulator download method
      _this.Tabulator.download('csv', `${_this.title || 'table'}.csv`)

    }}>${mapp.dictionary.download_csv}`

}

function clear_table_filters(_this) {

  return mapp.utils.html`
    <button class="flat"
      onclick=${() => {
      _this.Tabulator.clearFilter(true);
    }}>Clear Filters`;

}

function download_json(_this) {

  return mapp.utils.html`
    <button class="flat"
      onclick=${() => {
      _this.Tabulator.download('json', `${_this.title || 'table'}.json`)
    }}>Export as JSON`

}

function viewport(_this) {

  return mapp.utils.html`
    <button class=${`flat ${_this.viewport && 'active' || ''}`}
      onclick=${e => {
      e.target.classList.toggle('active')
      _this.viewport = !_this.viewport
      _this.update()
    }}>Viewport`

}

function layerfilter(_this) {

  return mapp.utils.html`
    <button class=${`flat ${_this.queryparams.filter && 'active' || ''}`}
      onclick=${e => {
      e.target.classList.toggle('active')
      _this.queryparams.filter = !_this.queryparams.filter
      _this.update()
      // If the button is active, set the layer filter to true, else set it to false.
      _this.layerFilter = e.target.classList.contains('active')

    }}>Layer Filter`

}