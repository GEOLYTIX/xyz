module.exports = fastify => (req, res, next, access) => {

  if (req.query.token === 'null') console.log(req.req.originalUrl);

  // Public access
  if (access.public) return next();

  // No token found.
  if (!req.query.token) {

    // Do not redirect API calls.
    if (access.API) return res.code(401).send('Invalid token');

    // Redirect to login with request URL as redirect parameter
    return require(global.appRoot + '/routes/login').view(req, res);
  }

  // Verify token (checks token expiry)
  fastify.jwt.verify(req.query.token, async (err, token) => {
    if (err) {
      fastify.log.error(err);
      return res.code(401).send('Invalid token');
    }

    // Token must have an email
    if (!token.email) return res.code(401).send('Invalid token');

    if (token.api) {

      // Get user from ACL.
      rows = await global.pg.users(`
          SELECT * FROM acl_schema.acl_table
          WHERE lower(email) = lower($1);`, [token.email]);
    
      if (rows.err) return require(global.appRoot + '/routes/login').view(req, res);
    
      const user = rows[0];
    
      if (!user.api || (user.api !== req.query.token)) return res.code(401).send('Invalid token');
    
      // Create a private token with 10second expiry.
      req.query.token = fastify.jwt.sign({
        email: user.email
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
    
    return require(global.appRoot + '/routes/login').view(req, res);

  });

};