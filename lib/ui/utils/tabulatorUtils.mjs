export default {
  headerFilter: {
    like,
    numeric,
    set
  },
  formatter: {
    toLocalString
  },
  select
}

function like(_this) {
  
  return (cell, onRendered, success, cancel, headerFilterParams) => {

    const field = cell.getColumn().getField()

    function likeFilter(e) {

      // Set layer filter and reload layer and table data.
      if (headerFilterParams.layerFilter) {

        if (e.target.value.length) {

          // Set filter
          _this.layer.filter.current[field] = {
            [headerFilterParams.type || 'like']: encodeURIComponent(e.target.value)
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
        _this.Tabulator.setFilter(filters)
      }
    }

    return mapp.utils.html.node`<span>
      <input
        type="text"
        placeholder="Filter"
        oninput=${likeFilter}
        onblur=${likeFilter}>`

  }
}

function numeric(_this) {

  return (cell, onRendered, success, cancel, headerFilterParams) => {

    // Select the field
    const field = cell.getColumn().getField()

    const inputMin = mapp.utils.html`
      <input 
        type="number" 
        placeholder="Min"
        oninput=${minEvent}
        onchange=${minEvent}
        onblur=${minEvent}>`

    function minEvent(e) {

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == '>=')

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layerFilter && delete _this.layer.filter.current[field]
      }

      // Add filter for valid target value.
      if (Number(e.target.value)) {
        _this.Tabulator.addFilter(field, '>=', Number(e.target.value))

        // Set layer filter
        if (headerFilterParams.layerFilter) {
          _this.layer.filter.current[field] = Object.assign(_this.layer.filter.current[field] || {}, {gte:Number(e.target.value)})
          _this.layer.reload();
          _this.update();  
        }
      }
    }

    const inputMax = mapp.utils.html`
      <input 
        type="number" 
        placeholder="Max" 
        oninput=${maxEvent}
        onchange=${maxEvent}
        onblur=${maxEvent}>`

    function maxEvent(e) {

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == '<=')

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layerFilter && delete _this.layer.filter.current[field]
      }

      // Add filter for valid target value.
      if (Number(e.target.value)) {
        _this.Tabulator.addFilter(field, '<=', Number(e.target.value))

        // Set layer filter
        if (headerFilterParams.layerFilter) {
          _this.layer.filter.current[field] = Object.assign(_this.layer.filter.current[field] || {}, { lte: Number(e.target.value) })
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

    if (headerFilterParams.distinct) {

      // Create dropdown for render.
      let dropdown = mapp.utils.html.node`<div>`

      // Query distinct field values.
      mapp.utils.xhr(`${_this.layer.mapview.host}/api/query?` +
        mapp.utils.paramString({
          template: 'distinct_values',
          dbs: _this.layer.dbs,
          table: _this.layer.tableCurrent(),
          field
        })).then(response => {

          // Render dropdown with distinct values from response.
          mapp.utils.render(dropdown, mapp.ui.elements.dropdown({
            multi: true,
            placeholder: headerFilterParams.placeholder || 'Set filter',
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

    let dropdown = mapp.ui.elements.dropdown({
      multi: true,
      placeholder: headerFilterParams.placeholder || 'Set filter',
      entries: headerFilterParams.options.map(option => ({
        title: option,
        option: option,
        //selected: chkSet.has(val)
      })),
      callback 
    })

    return dropdown

    async function callback(e, options) {

      if (headerFilterParams.layerFilter) {

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

function toLocalString(_this) {

  return (cell, formatterParams, onRendered) => {

    let val = parseFloat(cell.getValue())

    if (isNaN(val)) return;

    return val.toLocaleString(formatterParams?.locale || 'en-GB', formatterParams?.options)
  }

}