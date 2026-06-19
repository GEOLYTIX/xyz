/**
## /utils/queryParams

The queryParams module exports the queryParams utility method.

@module /utils/queryParams
*/

/**
@function queryParams

@description
The queryParams method returns a params object for the creation of a query URL params string.

The utility facilitates the creation of params argument for the [mapp.utils.paramString()]{@link module:/utils/paramString~paramString} method.

The queryParams method is particularly useful for calculating the current [viewport] bounds for a data query and to determine the current table for the mapviews current zoom level.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@property {Object} [_this.queryparams] Parameter object for the query.
@property {layer} [_this.layer] A dataview associated with a mapp layer will have a layer reference.
@returns {object} A params object to create a params string.
*/
export default function queryParams(_this) {
  // Must be an empty object if undefined.
  _this.queryparams ??= {};

  const layer = _this.layer || _this.location?.layer;

  // Merge layer queryparams with request queryparams.
  // _this.queryparams takes precedence.
  if (layer?.queryparams) {
    _this.queryparams = {
      ...layer.queryparams,
      ..._this.queryparams,
    };
  }

  const params = {
    ..._this.queryparams,
  };

  params.viewport ??= _this.viewport;

  // Queries will fail if the template can not be accessed in workspace.
  params.template ??= encodeURIComponent(_this.query);

  if (typeof params.locale !== 'string') {
    // set locale param from mapview or location if not provided as string.
    params.locale =
      layer?.mapview?.locale?.key || _this.location?.locale || undefined;
  }

  if (typeof params.layer !== 'string') {
    // set layer param from layer key if not provided as string.
    params.layer = layer?.key || undefined;
  }

  tableParam(_this, params);

  viewportParam(_this, params);

  geomParam(_this, params);

  centerParam(_this, params);

  if (params.filter === true) {
    params.filter = layer?.filter?.current;
  }

  if (params.id === true) {
    params.id = _this.location?.id;
  }

  if (params.qID === true) {
    params.qID = _this.location?.layer?.qID;
  }

  if (params.email === true) {
    params.email = mapp.user?.email;
  }

  if (params.z === true) {
    params.z = layer?.mapview?.Map?.getView()?.getZoom();
  }

  return params;
}

/**
@function tableParam

@description
Assigns table param to params object if a table can be found on the _this object or its location or layer.

The method will shortcircuit if a table param is already provided as a string if the param is nullish.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@param {Object} params The params object to set the table param on if found.
@property {location} [_this.location] A mapp location associated with _this object.
@property {layer} [location.layer] A mapp layer associated with _this.location.
@property {layer} [_this.layer] A mapp layer associated with _this object.
*/
function tableParam(_this, params) {
  if (!params.table) return;

  if (typeof params.table === 'string') return;

  if (_this.location?.layer?.table) {
    params.table = _this.location.layer.table;
    return;
  }

  if (_this.layer?.table) {
    params.table = _this.layer.table;
    return;
  }

  if (_this.location?.layer?.tableCurrent) {
    params.table = _this.location.layer.tableCurrent();
    return;
  }

  if (_this.layer?.tableCurrent) {
    params.table = _this.layer.tableCurrent();
    return;
  }

  if (_this.layer?.tables) {
    const table = Object.values(_this.layer.tables).find((table) => !!table);
    params.table = table;
    return;
  }

  if (_this.location?.layer?.tables) {
    const table = Object.values(_this.location.layer.tables).find(
      (table) => !!table,
    );
    params.table = table;
    return;
  }
}

/**
@function viewportParam

@description
Assigns viewport param to params object if the viewport of the mapview can be found from the _this.layer.

The method will shortcircuit if a viewport param is already provided as a string or if the layer or mapview is not found.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@param {Object} params The params object to set the viewport param on if found.
@property {layer} [_this.layer] A mapp layer associated with _this object. The layer is required to calculate a viewport, center, zoom [z], or table [if not explicit].
*/
function viewportParam(_this, params) {
  if (!params.viewport) return;

  if (typeof params.viewport === 'string') return;

  const mapview = _this.layer?.mapview || _this.location?.layer?.mapview;

  if (!mapview) return;

  const extent = mapview.getBounds();

  // Convert extent to an array and add the mapview.srid to the end of the array to create a viewport param value.
  params.viewport = [
    extent.west,
    extent.south,
    extent.east,
    extent.north,
    mapview.srid,
  ];
}

/**
@function geomParam

@description
Assign the geom param value from the layer object.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@param {Object} params The params object to set the geom param on if found.
@property {boolean} params.geom The geom param is set to true to trigger the assignment of the geom param value.
@property {layer} [_this.layer] A mapp layer associated with _this object.
*/
function geomParam(_this, params) {
  if (params.geom !== true) {
    return;
  }

  params.geom = _this.layer?.geomCurrent();
}

/**
@function centerParam

@description
Assigns center param to params object if the center of the mapview can be found from the _this.layer.

The method will shortcircuit if a center param is already provided as a string or if the layer or mapview is not found.

@param {Object} _this Object from which the query originates, eg. layer, dataview entry.
@param {Object} params The params object to set the center param on if found.
@property {layer} [_this.layer] A mapp layer associated with _this object. The layer is required to calculate a viewport, center, zoom [z], or table [if not explicit].
*/
function centerParam(_this, params) {
  if (!params.center) return;

  if (typeof params.center === 'string') return;

  const center = _this.layer.mapview.Map.getView().getCenter();

  params.center = ol.proj.transform(
    center,
    `EPSG:${_this.layer.mapview.srid}`,
    `EPSG:4326`,
  );

  params.lat = center?.[1];
  params.lng = center?.[0];
}
