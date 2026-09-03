/**
## /layer/formats/mvt

The module exports the "mvt" format method for the Mapp layer decorator method.

@requires /layer/featureFormats
@requires /layer/featureStyle
@requires /layer/styleParser

@module /layer/formats/mvt
*/

/**
@function MVT

@description
The MVT format method receives a JSON layer argument from the mapp.layer.decorator and assigns format specific functions to the layer object.

The SRID of an MVT layer must be 3857.

The MVT format method will call the styleParser to check the layer.style{} configuration.

A layer.reload() method will be assigned to reload the layer data from rest.

A layer.featureSource will be assigned for feature geometries.

A layer.source will be assigned for render features.

@param {layer} layer JSON layer
@property {Object} [layer.params] Parameter for layer data queries.
@property {number} [layer.transition] The transition duration for the layer.
@property {boolean} [layer.wkt_properties] A flag whether feature properties should be loaded independent from MVT geometries.
@property {number} [layer.cacheSize] The cache size for the layer tiles.
*/

export default function MVT(layer) {
  // Assign default SRID if nullish.
  layer.srid ??= '3857';

  // If 4326, return an error as this is not supported anymore.
  if (layer.srid !== '3857') {
    console.warn(`Layer ${layer.key} must be set to use SRID 3857.`);
    return;
  }

  // Update feature style config.
  mapp.layer.styleParser(layer);

  // Set default layer params if nullish.
  layer.params ??= {};

  if (layer.mvt_cache) {
    console.warn(`Layer ${layer.key} mvt_cache has been disabled.`);
  }

  // MVT query must not have a viewport, this is defined by the tile extent.
  delete layer.params.viewport;

  layer.reload = reload;

  /**
  @function reload

  @description
  The reload method executes the wktPropertiesLoad method for MVT layer with wkt_properties features.

  The MVT tiles of a wkt_properties layer hold feature geometries and ID only. The tile source is not affected by a change of the layer filter, style, or params. Clearing the tile source would render the layer blank before the wktPropertiesLoad method has returned the feature properties for the current layer filter. The layer is instead rendered from the wktPropertiesLoad method which will clear and refresh the tile sources itself for a feature which has not been rendered before, eg. after a location geometry has been created.

  Otherwise the source and featureSource [Openlayers VectorTile]{@link https://openlayers.org/en/latest/apidoc/module-ol_source_VectorTile.html} sources are cleared and refreshed.
  */
  function reload() {
    if (layer.wkt_properties) {
      wktPropertiesLoad(layer, true);
      return;
    }

    layer.source.clear();
    layer.source.refresh();
    layer.featureSource.refresh();
  }

  // The snapSource is required for snap interactions on vector tile layer.
  layer.featureSource = new ol.source.VectorTile({
    cacheSize: 0,
    format: new ol.format.MVT({
      featureClass: ol.Feature,
      //idProperty: 'id'
    }),
    tileUrlFunction: tileUrlFunction(layer),
    transition: 0,
  });

  // Define source for mvt layer.
  layer.source = new ol.source.VectorTile({
    cacheSize: layer.cacheSize || 0,
    format: new ol.format.MVT(),
    transition: layer.transition,
  });

  // Assign wkt properties load method.
  if (layer.wkt_properties) {
    layer.source.setTileUrlFunction(wktTileUrlFunction(layer));
    layer.changeEndCallbacks = [wktPropertiesLoad];
  } else if (layer.featureLookup) {
    layer.source.setTileUrlFunction(wktTileUrlFunction(layer));
  } else {
    layer.source.setTileUrlFunction(tileUrlFunction(layer));
  }

  layer.L = new ol.layer.VectorTile({
    className: `mapp-layer-${layer.key}`,
    key: layer.key,
    renderBuffer: 200,
    source: layer.source,
    style: mapp.layer.featureStyle(layer),
    //renderMode: 'vector',
    zIndex: layer.zIndex,
  });
}

/**
@function tileUrlFunction

@description
Returns a function that generates the tile URL to request an MVT tile with MVT geometries and properties required for theming.

@param {layer} layer A decorated format:mvt mapp layer.

@returns {function} A function that generates the tile URL for a given tile coordinate.
*/

function tileUrlFunction(layer) {
  return (tileCoord) => {
    const table = layer.tableCurrent();

    // The layer has no data for this zoom level.
    if (!table) {
      layer.source.clear();
      return;
    }

    // The layer does not display and doesn't have clones.
    if (!layer.display) {
      layer.source.clear();
      return;
    }

    const geom = layer.geomCurrent();

    // Set request params.fields for styling.
    layer.params.fields = mapp.layer.featureFields.fieldsArray(layer);

    const url = `${layer.mapview.host}/api/query?${mapp.utils.paramString({
      filter: layer.filter?.current,
      geom,
      layer: layer.key,
      locale: layer.mapview.locale.key,
      table,
      template: 'mvt',
      x: tileCoord[1],
      y: tileCoord[2],
      z: tileCoord[0],
      ...layer.params,
    })}`;

    return url;
  };
}

/**
@function wktTileUrlFunction

@description
Returns a function that generates the tile URL to request an MVT tile with MVT geometries and ID only.

Feature properties will be requested independently.

@param {layer} layer A decorated format:mvt mapp layer.

@returns {function} A function that generates the tile URL for a given tile coordinate.
*/

function wktTileUrlFunction(layer) {
  return (tileCoord) => {
    const table = layer.tableCurrent();

    // The layer has no data for this zoom level.
    if (!table) {
      layer.source.clear();
      return;
    }

    // The layer does not display and doesn't have clones.
    if (!layer.display) {
      layer.source.clear();
      return;
    }

    const geom = layer.geomCurrent();

    const url = `${layer.mapview.host}/api/query?${mapp.utils.paramString({
      geom,
      layer: layer.key,
      layer_template: layer.params?.layer_template,
      locale: layer.mapview.locale.key,
      srid: layer.mapview.srid,
      table,
      template: 'mvt',
      x: tileCoord[1],
      y: tileCoord[2],
      z: tileCoord[0],
    })}`;

    return url;
  };
}

/**
@function wktPropertiesLoad
@async

@description
The wktPropertiesLoad method is triggered from the layer.changeEndCallbacks methods array when the mapview view is changed. The method is also triggered from the reload method which is called when the layer display is toggled on.

The wktPropertiesLoad method send a query to the wkt template. The response is passed to the [featureFormats.wkt_properties]{@link module:/layer/featureFormats~wkt_properties} method.

Finally the layer.L.changed() method is called to trigger the [layer.featureStyle]{@link module:/layer/featureStyle~featureProperties} method which assigns feature properties from the layer.featuresObject.

The tile sources are cleared and refreshed if the method has been called from the layer.reload method and the response holds a feature which has not been rendered before, eg. after a location geometry has been created. The tile geometries are otherwise requested by the tile source itself for the current mapview.

@param {layer} layer A decorated format:mvt mapp layer.
@param {boolean} [reload] The method has been called from the layer.reload method.
@property {boolean} [layer.wkt_properties] A flag whether feature properties should be loaded independent from MVT geometries.
*/
async function wktPropertiesLoad(layer, reload) {
  if (!layer.wkt_properties) return;

  const table = layer.tableCurrent();

  if (!table || !layer.display) {
    layer.source.clear();
    return;
  }

  const geom = layer.geomCurrent();

  layer.params.fields = mapp.layer.featureFields.fieldsArray(layer);

  const bounds = layer.mapview.getBounds();

  // Assign current viewport if queryparam is truthy.
  const viewport = [
    bounds.west,
    bounds.south,
    bounds.east,
    bounds.north,
    layer.mapview.srid,
  ];

  // Assign current viewport if queryparam is truthy.
  const z = layer.mapview.Map.getView().getZoom();

  const paramString = mapp.utils.paramString({
    filter: layer.filter?.current,
    geom,
    layer: layer.key,
    locale: layer.mapview.locale.key,
    no_geom: true,
    table,
    template: 'wkt',
    viewport,
    z,
    ...layer.params,
  });

  const url = `${layer.mapview.host}/api/query?${paramString}`;

  // Debounce request to prevent the query being sent multiple times on initial load.
  const response = await mapp.utils.xhr({
    url,
    debounce: {
      key: layer.key,
      delay: 500,
    },
  });

  // The method must shortcircuit on debounce other no features would be rendered.
  if (response?.debounce) return;

  // The feature IDs prior to the response determine whether the tile geometries must be requested again.
  const featureIds = new Set(Object.keys(layer.featuresObject ?? {}));

  // The featuresObject should be reset before being populated by the featureFormats.wkt_properties method for use in the featureStyle method.
  // The featuresObject should be empty if the xhr query fails to provide an array response.
  layer.featuresObject = {};

  if (Array.isArray(response)) {
    // Set request params.fields for styling.
    mapp.layer.featureFormats.wkt_properties(layer, response);
  }

  // Triggers the featureStyle method.
  layer.L.changed();

  // The tile geometries are requested by the tile source itself on a mapview change.
  if (!reload) return;

  // Features which are no longer in the featuresObject are not rendered by the featureStyle method. Only a feature which has not been rendered before requires its geometry to be requested.
  const geometry = Object.keys(layer.featuresObject).some(
    (id) => !featureIds.has(id),
  );

  if (!geometry) return;

  layer.source.clear();
  layer.source.refresh();
  layer.featureSource.refresh();
}
