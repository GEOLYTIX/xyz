export default async (_this) => {

  // Assign column formatter from plugin.
  // (function colPlugins(cols) {
  //   cols.forEach((col) => {
  //     if (col.plugin) col.formatter = mapp.plugins[col.plugin];
  //     col.columns && colPlugins(col.columns);
  //   });
  // })(_this.columns);

  _this.Tabulator = await mapp.ui.utils.Tabulator(
    _this.target,
    _this.table
    // Object.assign(
    //   {
    //     columns: _this.columns,
    //     layout: "fitDataFill",
    //     selectable: _this.selectable || false,
    //     data: _this.data
    //   },
    //   _this.options || {}
    // )
  );

  _this.table.selectable && _this.Tabulator.on("rowClick", (e, row) => {

    if (typeof _this.rowSelect === 'function') {
      _this.rowSelect(e, row)
      return;
    }

    const rowData = row.getData();

    if (!_this.layer || !rowData[_this.layer.qID]) return;

    mapp.location.get({
      layer: _this.layer,
      id: rowData[_this.layer.qID],
      //_flyTo: true,
    });

    // Remove selection colour on row element.
    row.deselect();
  });

  // Set Tabulator data.
  _this.setData = (data) => {

    if (!data && _this.data) return;

    if (_this.noDataMask && !data) {

      // Remove display from target
      _this.target.style.display = 'none'

      // Set no data mask on dataview target
      _this.mask = !_this.mask && _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)

    } else {

      // Remove existing dataview mask.
      _this.mask && _this.mask.remove()
      delete _this.mask

      // Set dataview target to display as block.
      _this.target.style.display = 'block'
    }

    // Tabulator data must be an array.
    data = (!data && []) || (data.length && data) || [data];

    // Set data to the tabulator object
    _this.Tabulator.setData(data);

    // Assign data to the dataview object
    _this.data = data;

    typeof _this.setDataCallback === 'function'
      && _this.setDataCallback(_this)
  }

}