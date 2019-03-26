module.exports = fastify => {

  return {
    token: _token,
    locale: _locale,
    layer: _layer,
    roles: _roles,
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

    if (!req.params.layer.roles) return next();

    if (!Object.keys(req.params.layer.roles).some(
      role => req.params.token.roles.includes(role)
    )){
      res.code(400);
      return next(new Error('Insufficient role priviliges.'));
    }

    // Parse filter from query string.
    req.params.filter = req.query.filter && JSON.parse(req.query.filter) || {};

    // Apply role filter
    req.params.token.roles.filter(
      role => req.params.layer.roles[role]).forEach(
      role => Object.assign(req.params.filter, req.params.layer.roles[role])
    );

    next();

  };

};