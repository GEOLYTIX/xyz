module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/auth/token/api',
    beforeHandler: fastify.auth([fastify.authAccess]),
    handler: (req, res) => {

      // Verify token.
      fastify.jwt.verify(req.query.token, async (err, token) => {

        if (err) {
          fastify.log.error(err);
          return res.code(401).send('Invalid token');
        }
  
        // Get user from ACL.
        var rows = await global.pg.users(`
        SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`,
        [token.email]);
    
        if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
        const user = rows[0];
  
        if (!user
          || !user.api
          || !user.verified
          || !user.approved) return res.code(401).send('Invalid token');
  
        // Create signed api_token
        const api_token = fastify.jwt.sign({
          email: user.email,
          access: 'api'
        });
  
        // Store api_token in ACL.
        var rows = await global.pg.users(`
        UPDATE acl_schema.acl_table SET api = '${api_token}'
        WHERE lower(email) = lower($1);`,
        [user.email]);
    
        if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
        // Send ACL token.
        res.send(api_token);
      });
    }
  });

};