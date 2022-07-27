export default {
  headerFilter: {
    like,
    numeric,
  }
}

function like(_this) {
  
  return (cell, onRendered, success, cancel, headerFilterParams) => {

    const field = cell.getColumn().getField()

    function likeFilter(e) {

      // Get filter for that field if exists
      const filter = _this.Tabulator.getFilters().find(f => f.field === field && f.type == ">=")

      // Remove existing filter
      if (filter) {
        _this.Tabulator.removeFilter(...Object.values(filter))

        // Remove layer filter
        headerFilterParams.layer && delete _this.layer.filter.current[field]
      }

      if (e.target.value.length) {

        _this.Tabulator.setFilter([
          { field: field, type: "like", value: e.target.value }, //filter by age greater than 52
        ]);

        if (headerFilterParams.layer) {

          _this.layer.filter.current[field] = {
            [headerFilterParams.type]: encodeURIComponent(e.target.value)
          }
          _this.layer.reload();
          _this.update();
        }
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