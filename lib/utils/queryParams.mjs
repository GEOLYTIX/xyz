/**
## /utils/queryParams

The queryParams module exports the queryParams utility method for layer and dataview requests.

@module /utils/queryParams
*/

export default queryParams;

/**
@function queryParams

@description
The queryParams method returns a params object for the creation of a query URL params string.

The utility facilitates the creation of params argument for the [mapp.utils.paramString()]{@link module:/utils/paramString~paramString} method.

from the [dataview.update()]{@link module:/ui/Dataview~updateDataview} method.
```js
// Compile params object from dataview this.
const params = mapp.utils.queryParams(this);

// Stringify paramString from object.
const paramString = mapp.utils.paramString(params);

this.host ??= this.layer?.mapview?.host

// Query data as response from query.
const response = await mapp.utils.xhr(`${this.host || mapp.host}/api/query?${paramString}`);
```
The queryParams method is particularly useful for calculating the current [viewport] bounds for a data query and to determine the current table for the mapviews current zoom level.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@property {Object} _this.queryparams Parameter object for the query.
@property {Boolean} [queryparams.layer] The layer associated with the requesting object _this should be provided as request param.
@property {layer} [_this.layer] The layer associated with _this object. The layer is required to calculate a viewport, center, zoom [z], or table [if not explicit].
@property {Boolean} [_this.viewport] Calculate the bounds for the current viewport of the mapview for _this.layer.
@returns {object} A params object to create a params string.
*/
function queryParams(_this) {
  // Must be an empty object if undefined.
  _this.queryparams ??= {};

  // If queryparams is not an object, return.
  if (typeof _this.queryparams !== 'object') {
    console.warn('queryparams must be an object');
    return;
  }

  let layer = _this.layer || _this.location?.layer;

  // Merge layer queryparams with request queryparams.
  if (layer?.queryparams) {
    Object.assign(_this.queryparams, layer.queryparams);
  }

  // Assign table from layer JSON or layer.tableCurrent() method.
  _this.queryparams.table &&=
    typeof _this.queryparams.table === 'string'
      ? _this.queryparams.table
      : getTable(_this);

  // Get bounds from mapview.
  const bounds = _this.viewport && _this.layer.mapview.getBounds();

  const geom =
    typeof _this.queryparams.geom === 'string'
      ? _this.queryparams.geom
      : getGeom(_this);

  // Get center from mapview.
  const center =
    _this.queryparams.center &&
    ol.proj.transform(
      _this.layer.mapview.Map.getView().getCenter(),
      `EPSG:${_this.layer.mapview.srid}`,
      `EPSG:4326`,
    );

  // Queries will fail if the template can not be accessed in workspace.
  const template =
    _this.queryparams.template || encodeURIComponent(_this.query);

  // Layer filter can only be applied if the layer is provided as reference to a layer object in the layers list.
  const filter = _this.queryparams.filter ? layer?.filter?.current : undefined;

  // Locale param is only required for layer lookups.
  const locale =
    layer?.mapview?.locale.key || _this.location?.locale || undefined;

  // ID will be taken if a location object is provided with the params.
  const id = _this.queryparams.id ? _this.location?.id : undefined;

  // qID will be taken if a location object is provided with the params.
  const qID = _this.queryparams.qID ? _this.location?.layer?.qID : undefined;

  // queryparams.email is a boolean property.
  const email = _this.queryparams.email ? mapp.user.email : undefined;

  // lat lng must be explicit or the center flag param must be set.
  const lat = center?.[1];
  const lng = center?.[0];

  // z will be generated if the z flag is set in the params.
  const z = _this.queryparams?.z && layer.mapview.Map.getView().getZoom();

  // Viewport will only be generated if the viewport flag is set on the params.
  const viewport = bounds && [
    bounds.west,
    bounds.south,
    bounds.east,
    bounds.north,
    layer.mapview.srid,
  ];

  // The layer maybe defined as string in the queryparams.
  layer = layer?.key || _this.queryparams.layer || undefined;

  const params = {
    ..._this.queryparams,
    email,
    fieldValues: undefined,
    filter,
    geom,
    id,
    lat,
    layer,
    lng,
    locale,
    qID,
    template,
    viewport,
    z, // The fieldValues array entries should not be part of the url params.
  };

  return params;
}

/**
@function getTable

@description
Returns the current table associated with a layer or location.layer which maybe dependent on the mapview zoom level.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@property {location} [_this.location] A mapp location associated with _this object.
@property {layer} [location.layer] A mapp layer associated with _this.location.
@property {layer} [_this.layer] A mapp layer associated with _this object.

@returns {string} Table name
*/
function getTable(_this) {
  return (
    _this.location?.layer?.table ||
    _this.layer?.table ||
    _this.location?.layer?.tableCurrent?.() ||
    _this.layer?.tableCurrent?.() ||
    _this.location?.layer?.tableCurrent?.() ||
    (_this.layer?.tables &&
      Object.values(_this.layer.tables).find((table) => !!table)) ||
    (_this.location?.layer?.tables &&
      Object.values(_this.location?.layer.tables).find((table) => !!table))
  );
}

/**
@function getGeom

@description
Returns the current geometry associated with a layer or location.layer which maybe dependent on the mapview zoom level.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@property {location} [_this.viewport] The viewport flag is set on the params.
@property {layer} [_this.layer] A mapp layer associated with _this object.

@returns {string} Table name
*/
function getGeom(_this) {
  return _this.viewport ? _this.layer.geomCurrent() : undefined;
}
