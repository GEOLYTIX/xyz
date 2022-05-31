export default _this => {
  
  // Assign empty object if not defined.
  _this.queryparams = _this.queryparams || {}

  // The layer queryparam must be true to support viewport params.
  _this.queryparams.layer = _this.viewport && true

  // Get bounds from mapview.
  const bounds = _this.viewport && _this.layer.mapview.getBounds();

  // Get center from mapview.
  const center = _this.queryparams.center && ol.proj.transform(
    _this.layer.mapview.Map.getView().getCenter(),
    `EPSG:${_xyz.mapview.srid}`,
    `EPSG:4326`)


  return Object.assign({}, _this.queryparams, {

    // Queries will fail if the template can not be accessed in workspace.
    template: encodeURIComponent(_this.query),

    // Layer filter can only be applied if the layer is provided as reference to a layer object in the layers list.
    filter: _this.queryparams.filter && _this.layer.filter?.current,

    // Locale param is only required for layer lookups.
    locale: _this.queryparams.layer && _this.layer.mapview.locale.key,

    // Locale param is only required for layer lookups.
    layer: _this.queryparams.layer && _this.layer.key,

    // ID will be taken if a location object is provided with the params.
    id: _this.queryparams?.id && _this.location?.id,

    // lat lng must be explicit or the the center flag param must be set.
    lat: center && center[1],
    lng: center && center[0],

    // z will generated if the z flag is set in the params.
    z: _this.queryparams?.z && _this.layer.mapview.Map.getView().getZoom(),

    // Viewport will onlcy be generated if the viewport flag is set on the params.
    viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _this.layer.mapview.srid]

  })
}