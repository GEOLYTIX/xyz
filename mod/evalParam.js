module.exports = fastify => {

  return {
    token: _token,
    locale: _locale,
    layer: _layer,
    roles: _roles,
    lnglat: _lnglat,
    layerTable: _layerTable,
    geomTable: _geomTable,
    layerValues: _layerValues,
    tableDef: _tableDef,
  };

  function _token (req, res, next) {

    req.params.token = req.query.token ?
      fastify.jwt.decode(req.query.token) :
      { access: 'public' };
        
    next();

  }

  function _locale (req, res, next) {

    req.params.locale = global.workspace.current.locales[req.query.locale];

    if (!req.params.locale) {
      res.code(400);
      return next(new Error('Invalid locale.'));
    }

    next();

  };

  function _layer (req, res, next) {

    req.params.layer = req.params.locale.layers[req.query.layer];

    if (!req.params.layer) {
      res.code(400);
      return next(new Error('Invalid layer.'));
    }

    next();

  };

  function _roles (req, res, next) {

    req.params.token.roles = req.params.token.roles || [];

    if (req.params.layer.roles) {

      if (!Object.keys(req.params.layer.roles).some(
        role => req.params.token.roles.includes(role)
      )){
        res.code(400);
        return next(new Error('Insufficient role priviliges.'));
      }
      
    }

    // Parse filter from query string.
    req.params.filter = req.query.filter && JSON.parse(req.query.filter) || {};

    // Apply role filter
    req.params.token.roles.filter(
      role => req.params.layer.roles && req.params.layer.roles[role]).forEach(
      role => Object.assign(req.params.filter, req.params.layer.roles[role])
    );

    next();

  };

  function _lnglat (req, res, next) {

    req.params.lnglat = req.query.lnglat.split(',').map(ll => parseFloat(ll));

    // Return 406 if lnglat is not defined as query parameter.
    if (!req.params.lnglat) {
      res.code(400);
      return next(new Error('Missing lnglat.'));
    }

    next();

  };

  function _geomTable (req, res, next) {

    if (req.query.table === req.params.layer.table) return next();

    if (Object.values(req.params.layer.tables || {}).some(
      table => table === req.query.table
    )) return next();

    res.code(400);
    return next(new Error('Missing layer table.'));
    
  };

  function _layerTable (req, res, next) {

    req.params.table = req.params.layer.tableview.tables[req.query.table];

    if (!req.params.table) {
      res.code(400);
      return next(new Error('Missing layer table.'));
    }

    next();

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

  async function _layerValues (req, res, next, vals) {

    const lookupValues = await createLookup(req.params.layer);

    if (!vals.some(
      val => req.query[val] && !lookupValues.has(req.query[val])
    )) return next();

    res.code(400);
    return next(new Error('Invalid querystring parameter.'));

  };

  function _tableDef (req, res, next) {

    req.params.tableDef = req.params.layer.infoj.find(
      entry => entry.title === decodeURIComponent(req.query.tableDef)
    );
    
    if (!req.params.tableDef) {
      res.code(400);
      return next(new Error('Missing table definition.'));
    }

    next();

  };

};