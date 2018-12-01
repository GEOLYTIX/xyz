module.exports = function(req, res, fastify, access, done) {

  // Public access
  if (access.lv === 'public') {
    req.query.token = req.query.token && req.query.token !== 'null' ? req.query.token : null;
    return done();
  }

  // No token found.
  if (!req.query.token) {

    // Do not redirect API calls.
    if (access.API) return res.code(401).send('Invalid token');

    // Redirect to login with request URL as redirect parameter
    return res.redirect(global.dir + '/login?redirect=' + req.req.url);
  }

  // Verify token (checks token expiry)
  fastify.jwt.verify(req.query.token, async (err, token) => {
    if (err) {
      console.log(JSON.stringify(token));
      fastify.log.error(err);
      return res.code(401).send('Invalid token');
    }

    // Token must have an email
    if (!token.email) return res.code(401).send('Invalid token');

    // Check API token.
    if (access.API && token.access === 'api') {

      // Get user from ACL.

      rows = await global.pg.users(`
      SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`,
      [token.email]);

      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

      const user = rows[0];

      if (!user.api || (user.api !== req.query.token)) return res.code(401).send('Invalid token');

      // Create a private token with 10second expiry.
      req.query.token = fastify.jwt.sign({
        email: user.email,
        access: 'private'
      }, { expiresIn: 10 });

      return done();
    }

    // Check admin privileges.
    if (access.lv === 'admin' && token.access !== 'admin') {

      // Do not redirect API calls.
      if (access.API) return res.code(401).send('Invalid token');

      // Redirect to login.
      return res.redirect(global.dir + '/login?msg=fail');
    }

    done();
  });
  
};