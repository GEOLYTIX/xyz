const env = require('../../mod/env');

module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/user/log',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_user: true
      })
    ]),
    handler: async (req, res) => {

      //const token = await fastify.jwt.decode(req.query.token);

      const email = req.query.email.replace(/\s+/g,'');

      // Get user to update from ACL.
      var rows = await env.acl(`
      SELECT access_log
      FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [email]);
  
      if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');
  
      return res.code(200).send(rows[0].access_log);
    }
  });

};