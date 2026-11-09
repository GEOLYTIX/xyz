/**
## mvtEncode

The mvtEncode middleware encodes the response of the testhost mvt query template as vector tile.

The devdb PostGIS can't create vector tiles with ST_AsMVT. The testhost [mvt template](templates/mvt.js) returns the features with their GeoJSON geometry in tile pixel coordinates. The middleware replaces the res.send method of an mvt template request and encodes the rows with [vt-pbf]{@link https://github.com/mapbox/vt-pbf} as a tile layer named by the layer key, like the core mvt template.

A response without rows is sent as an empty tile, as the ST_AsMVT aggregate of no rows. Error responses are sent unchanged.

@requires vt-pbf

@module testhost/mvtEncode
*/

import vtpbf from 'vt-pbf';

/**
The vector tile geometry types for the GeoJSON geometry types.
*/
const TYPES = {
  Point: 1,
  MultiPoint: 1,
  LineString: 2,
  MultiLineString: 2,
  Polygon: 3,
  MultiPolygon: 3,
};

/**
@function queryTemplate

@description
Returns the query template of an /api/query request. The XYZ API accepts the template as path param, eg. `/api/query/mvt`, or as query param, eg. `/api/query?template=mvt`.

The template is resolved like the XYZ validateRequestParams middleware: the query params are assigned over the path params, and the `_template` query param is the fallback.

The middleware is mounted at /api/query, so the path of a template path param request is `/{template}`.

@param {req} req The express request.
@returns {string|undefined} The query template.
*/
export function queryTemplate(req) {
  const pathTemplate = req.path.split('/')[1] || undefined;

  // The path isn't decoded. The template is only compared with 'mvt', and template keys are limited to whitelisted characters.
  return req.query.template ?? pathTemplate ?? req.query._template;
}

/**
@function mvtEncode

@description
Express middleware for /api/query requests. Requests with another template than mvt are passed on.

@param {req} req The express request.
@param {res} res The express response.
@param {function} next Calls the next middleware.
*/
export default function mvtEncode(req, res, next) {
  if (queryTemplate(req) !== 'mvt') return next();

  const send = res.send.bind(res);

  res.send = (body) => {
    // An error response is sent unchanged.
    if (res.statusCode >= 400) return send(body);

    // The query module sends a 202 text response without rows.
    const rows =
      res.statusCode === 202 ? [] : Array.isArray(body) ? body : [body];

    // The res.json method calls res.send with the stringified rows.
    if (typeof body === 'string' && res.statusCode !== 202) return send(body);

    res.status(200);
    res.set('Content-Type', 'application/x-protobuf');

    return send(Buffer.from(encode(req.query.layer, rows)));
  };

  next();
}

/**
@function encode

@description
Encodes the rows as vector tile layer. The mvt_geometry of a row is the GeoJSON geometry in tile pixel coordinates. The other row properties are the feature properties.

@param {string} layer The tile layer name.
@param {Array<Object>} rows The rows of the mvt query.
@returns {Uint8Array} The vector tile.
*/
export function encode(layer, rows) {
  const features = rows.flatMap(({ mvt_geometry, ...tags }) =>
    geometries(mvt_geometry).map((geometry) => ({
      type: TYPES[geometry.type],
      geometry: coordinates(geometry),
      tags,
    })),
  );

  return vtpbf.fromGeojsonVt({ [layer]: { features } }, { version: 2 });
}

/**
@function geometries

@description
Returns the geometries of a GeometryCollection, which may be returned from the ST_Intersection with the tile envelope.

@param {Object} geometry A GeoJSON geometry.
@returns {Array<Object>} The GeoJSON geometries with a vector tile type.
*/
function geometries(geometry) {
  if (!geometry) return [];

  if (geometry.type === 'GeometryCollection') {
    return geometry.geometries.flatMap(geometries);
  }

  return TYPES[geometry.type] ? [geometry] : [];
}

/**
@function coordinates

@description
Returns the geometry coordinates in the geojson-vt tile format. Points are an array of points, lines are an array of lines, and polygons are an array of rings. The polygon rings of a MultiPolygon are distinguished by their winding order.

@param {Object} geometry A GeoJSON geometry.
@returns {Array} The geojson-vt coordinates.
*/
function coordinates(geometry) {
  switch (geometry.type) {
    case 'Point':
      return [geometry.coordinates];
    case 'MultiPoint':
    case 'Polygon':
    case 'MultiLineString':
      return geometry.coordinates;
    case 'LineString':
      return [geometry.coordinates];
    case 'MultiPolygon':
      return geometry.coordinates.flat();
  }
}
