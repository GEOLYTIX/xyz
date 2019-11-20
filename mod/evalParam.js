const env = require('./env');

const jwt_decode = require('jwt-decode');

module.exports = {
  token: _token,
  locale: _locale,
  layer: _layer,
  roles: _roles,
  lnglat: _lnglat,
  coords: _coords,
  layerTable: _layerTable,
  layerChart: _layerChart,
  geomTable: _geomTable,
  layerValues: _layerValues,
  tableDef: _tableDef,
  userSchemaField: _userSchemaField,
  pgFunction: _pgFunction
};

function _token(req, res, next) {

  req.params.token = req.query.token ?
    jwt_decode(req.query.token) :
    { access: 'public', roles: [] };

  next();

}

function _locale(req, res, next) {

  req.params.locale = env.workspace.locales[req.query.locale];

  if (!req.params.locale) {
    res.code(400);
    return next(new Error('Invalid locale.'));
  }

  next();

};

function _layer(req, res, next) {

  req.params.layer = req.params.locale.layers[req.query.layer];

  if (!req.params.layer) {
    res.code(400);
    return next(new Error('Invalid layer.'));
  }

  next();

};

function _roles(req, res, next) {

  req.params.token.roles = req.params.token.roles || [];

  if (req.params.layer.roles) {

    if (!Object.keys(req.params.layer.roles).some(
      role => req.params.token.roles.includes(role)
    )) {
      res.code(400);
      return next(new Error('Insufficient role priviliges.'));
    }

  }

  // Parse filter from query string.
  req.params.filter = req.query.filter && JSON.parse(req.query.filter) || {};

  // Apply role filter
  req.params.token.roles.filter(
    role => req.params.layer.roles && req.params.layer.roles[role]).forEach(
    role => {
      let key = Object.keys(req.params.layer.roles[role])[0];
      if (!req.params.filter[key]) {
        Object.assign(req.params.filter, req.params.layer.roles[role]);

      } else {
        req.params.filter[key] = Array.prototype.concat(req.params.filter[key], req.params.layer.roles[role][key]);

      }
    }
  );

  next();

};

function _lnglat(req, res, next) {

  req.params.lnglat = req.query.lnglat.split(',').map(ll => parseFloat(ll));

  // Return 406 if lnglat is not defined as query parameter.
  if (!req.params.lnglat) {
    res.code(400);
    return next(new Error('Missing lnglat.'));
  }

  next();

};

function _coords(req, res, next) {

  req.params.coords = req.query.coords.split(',').map(xy => parseFloat(xy));

  // Return 406 if lnglat is not defined as query parameter.
  if (!req.params.coords) {
    res.code(400);
    return next(new Error('Missing coords.'));
  }

  next();

};

function _layerTable(req, res, next) {

  req.params.table = req.params.layer.dataview[req.query.table];

  if (!req.params.table) {
    res.code(400);
    return next(new Error('Missing layer table.'));
  }

  next();

};

function _layerChart(req, res, next) {

  req.params.chart = req.params.layer.dataview[req.query.chart];

  if (!req.params.chart) {
    res.code(400);
    return next(new Error('Missing chart table.'));
  }

  next();

};

function _geomTable(req, res, next) {

  if (req.query.table === req.params.layer.table) return next();

  if (Object.values(req.params.layer.tables || {}).some(
    table => table === req.query.table
  )) return next();

  res.code(400);
  return next(new Error('Missing layer table.'));

};

async function _layerValues(req, res, next, vals) {

  const lookupValues = await createLookup(req.params.layer);

  if (!vals.some(
    val => req.query[val] && !lookupValues.has(req.query[val])
  )) return next();

  res.code(400);
  return next(new Error('Invalid querystring parameter.'));

};

function _tableDef(req, res, next) {

  req.params.tableDef = req.params.layer.infoj.find(
    entry => entry.title === decodeURIComponent(req.query.tableDef)
  );

  if (!req.params.tableDef) {
    res.code(400);
    return next(new Error('Missing table definition.'));
  }

  next();

};

function _pgFunction(req, res, next) {

  req.params.pgFunction = req.params.layer.infoj.find(
    entry => entry.pgFunction === decodeURIComponent(req.query.pgFunction)
  );

  if (!req.params.pgFunction) {
    res.code(400);
    return next(new Error('Missing pgFunction definition.'));
  }

  next();

};

function _userSchemaField(req, res, next) {

  const userSchemaFields = new Set([
    'approved',
    'verified',
    'admin_user',
    'admin_workspace',
    'blocked',
    'roles'
  ]);

  if (userSchemaFields.has(req.query.field)) return next();

  res.code(400);
  return next(new Error('Invalid querystring parameter.'));

};

function createLookup(entry) {

  // store all workspace string values in lookup arrays.
  const lookupValues = new Set();
  (function objectEval(o) {
    Object.keys(o).forEach((key) => {
      if (typeof key === 'string') lookupValues.add(key);
      if (typeof o[key] === 'string') lookupValues.add(o[key]);
      if (o[key] && typeof o[key] === 'object') objectEval(o[key]);
    });
  })(entry);

  return lookupValues;

}