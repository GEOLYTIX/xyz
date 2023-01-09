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

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == "like")

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layer && delete _this.layer.filter.current[field]
      }

      if(e.target.value.length) _this.Tabulator.setFilter([
        { field: field, type: "like", value: e.target.value }
      ])

      if (headerFilterParams.layer) {

          e.target.value.length ? (_this.layer.filter.current[field] = {
            [headerFilterParams.type]: encodeURIComponent(e.target.value) 
          }) : delete _this.layer.filter.current[field];
          
          _this.layer.reload();
          
      }

      _this.update();

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
        onchange=${minEvent}
        onblur=${minEvent}>`

    function minEvent(e) {

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == ">=")

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layer && delete _this.layer.filter.current[field]
      }

      // Add filter for valid target value.
      if (Number(e.target.value)) {
        _this.Tabulator.addFilter(field, ">=", Number(e.target.value))

        // Set layer filter
        if (headerFilterParams.layer) {
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
        onchange=${maxEvent}
        onblur=${maxEvent}>`

    function maxEvent(e) {

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == "<=")

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layer && delete _this.layer.filter.current[field]
      }

      // Add filter for valid target value.
      if (Number(e.target.value)) {
        _this.Tabulator.addFilter(field, "<=", Number(e.target.value))

        // Set layer filter
        if (headerFilterParams.layer) {
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

     headerFilterParams.set = new Set()

    function callback(cell, set) {

      _this.filter[cell.getField()] = {}

      if (set.size) _this.filter[cell.getField()].in = Array.from(set)
                
      if(headerFilterParams.maxRows && _this.Tabulator.getDataCount() > headerFilterParams.maxRows-1) return _this.update()

      if(_this.Tabulator.getFilters().length) {
        let filter = _this.Tabulator.getFilters().find(f => f.field == cell.getField() && f.type == "in")
        if(filter) _this.Tabulator.removeFilter(filter.field, filter.type, filter.value)
      }

      if(set.size) _this.Tabulator.addFilter(cell.getField(), "in", Array.from(set)) 

      if(typeof(headerFilterParams.callback) === 'function') headerFilterParams.callback(cell, headerFilterParams.set)
        
    }

    const select = mapp.utils.html.node`
    <select style="border: 0; width: 100%; font-size: 11px;"
    onchange=${e => {

      const val = e.target.value

      headerFilterParams?.set.has(val)
      && headerFilterParams.set.delete(val)
      || headerFilterParams.set.add(val)
            
      for (let i=0; i<e.target.options.length; i++) {

        e.target.options[i].style.backgroundColor = headerFilterParams.set
        .has(e.target.options[i].value) && (headerFilterParams.selected || '#cae0b8') || '#ffffff'
      }

      callback(cell, headerFilterParams.set)

      e.target.value = null

    }}>${headerFilterParams.options.map(option => mapp.utils.html.node`
      <option>${option}`)}`

    select.value = null

    if(headerFilterParams.multiple) select.multiple = true

    return select
  
  }

}

function select(_this, params) {

  return (e, row) => {

    // Get the row data
    const rowData = row.getData();

    // If the layer or qID don't exist, then return
    if (!_this.layer || !rowData[_this.layer.qID]) return;

    // Get the location using the layer and qID which will select the location in the location panel 
    mapp.location.get({
      layer: _this.layer,
      id: rowData[_this.layer.qID],
    })

      // Zoom to the location if the params flag is set.
      .then(location => params.zoomToLocation && location.flyTo());

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