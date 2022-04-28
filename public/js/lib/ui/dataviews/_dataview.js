import Table from "./table.js";
import Chart from "./chart.js";
export default async (_this) => {
  _this.target = typeof _this.target === "string" && document.getElementById(_this.target) || _this.target;
  _this.target = _this.target instanceof HTMLElement && _this.target || mapp.utils.html.node`
      <div
        class="dataview-target"
        style="position: absolute; width: 100%; height: 100%">`;
  _this.update = async () => {
    if (!_this.query)
      return;
    const bounds = _this.viewport && _this.layer.mapview.getBounds();
    if (_this.viewport)
      _this.queryparams = Object.assign(_this.queryparams || {}, {layer: true});
    const center = _this.queryparams?.center && ol.proj.transform(_this.layer.mapview.Map.getView().getCenter(), `EPSG:${_xyz.mapview.srid}`, `EPSG:4326`);
    const paramString = mapp.utils.paramString(Object.assign({}, _this.queryparams || {}, {
      template: encodeURIComponent(_this.query),
      filter: _this.queryparams?.filter && _this.layer?.filter?.current,
      layer: _this.queryparams?.layer && _this.layer.key,
      locale: _this.queryparams?.layer && _this.layer.mapview.locale.key,
      id: _this.queryparams?.id && _this.location && _this.location.id,
      lat: center && center[1],
      lng: center && center[0],
      z: _this.queryparams?.z && _this.layer.mapview.Map.getView().getZoom(),
      viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _this.layer.mapview.srid]
    }));
    const response = await mapp.utils.xhr(`${_this.host || _this.location.layer.mapview.host}/api/query?` + paramString);
    if (response instanceof Error)
      return;
    if (typeof _this.responseFunction === "function")
      return _this.responseFunction(response);
    typeof _this.setData === "function" && _this.setData(response);
  };
  if (_this.toolbar) {
    _this.target = mapp.utils.html.node`
      <div class="dataview-target">`;
    const toolbar_els = Object.keys(_this.toolbar).map((key) => mapp.ui.elements.toolbar_el[key](_this));
    _this.panel = mapp.utils.html.node`
      <div class="grid">
        <div class="btn-row">${toolbar_els}</div>
        ${_this.target}`;
  }
  if (_this.chart)
    await Chart(_this);
  if (typeof _this.columns !== "undefined") {
    console.warn("Table dataviews should be configured inside a tables object");
    _this.table = {columns: _this.columns};
  }
  if (_this.table)
    await Table(_this);
  _this.mapChange && _this.layer && _this.layer.mapview.Map.getTargetElement().addEventListener("changeEnd", () => {
    if (_this.layer && !_this.layer.display)
      return;
    if (_this.tab && !_this.tab.classList.contains("active"))
      return;
    typeof _this.mapChange === "function" && _this.mapChange() || _this.update();
  });
  return _this;
};
