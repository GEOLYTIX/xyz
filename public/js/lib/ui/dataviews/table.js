export default async (_this) => {
  _this.Tabulator = await mapp.ui.utils.Tabulator(_this.target, _this.table);
  _this.table.selectable && _this.Tabulator.on("rowClick", (e, row) => {
    if (typeof _this.rowSelect === "function") {
      _this.rowSelect(e, row);
      return;
    }
    const rowData = row.getData();
    if (!_this.layer || !rowData[_this.layer.qID])
      return;
    mapp.location.get({
      layer: _this.layer,
      id: rowData[_this.layer.qID]
    });
    row.deselect();
  });
  _this.setData = (data) => {
    if (!data && _this.data)
      return;
    if (_this.noDataMask && !data) {
      _this.target.style.display = "none";
      _this.mask = !_this.mask && _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`);
    } else {
      _this.mask && _this.mask.remove();
      delete _this.mask;
      _this.target.style.display = "block";
    }
    data = !data && [] || data.length && data || [data];
    _this.Tabulator.setData(data);
    _this.data = data;
    typeof _this.setDataCallback === "function" && _this.setDataCallback(_this);
  };
};
