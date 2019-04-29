const env = require('./env');

module.exports = fastify => (req, res, next, access = {}) => {

  if (req.query.token === 'null') {
    delete req.query.token;
  }

  // Public access without token.
  if (!req.query.token && access.public && env.public) {
    return next();
  }

  // Redirect to login
  if (!req.query.token && access.login) {
    return fastify.login.view(req, res);
  }

  // Private access without token.
  if (!req.query.token) {
    return res.code(401).send(new Error('Missing token.'));
  }

  // Verify token (checks token expiry)
  fastify.jwt.verify(req.query.token, async (err, token) => {
    if (err) {
      fastify.log.error(err);
      return res.code(401).send(new Error('Invalid token.'));
    }

    // Token must have an email
    if (!token.email) {
      return res.code(401).send(new Error('Invalid token.'));
    }

    if (token.api) {

      // Get user from ACL.
      rows = await env.acl(`
      SELECT * FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`, [token.email]);
    
      if (rows.err) return fastify.login.view(req, res);
    
      const user = rows[0];
    
      if (!user.api
        || (user.api !== req.query.token)) {
        return res.code(401).send(new Error('Invalid token.'));
      }
    
      // Create a private token with 10second expiry.
      req.query.token = fastify.jwt.sign({
        email: user.email,
        roles: user.roles
      }, {
        expiresIn: 10
      });
    
      return next();
    }

    // Continue if neither admin nor editor previliges are required.
    if (!access.admin_user && !access.admin_workspace) return next();

    // Check admin_user privileges.
    if (access.admin_user && token.admin_user) return next();

    // Check admibn_workspace privileges.
    if (access.admin_workspace && token.admin_workspace) return next();

    res.code(401).send(new Error('Invalid token.'));

  });

};