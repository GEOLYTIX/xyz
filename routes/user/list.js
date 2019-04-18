const env = require('../../mod/env');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/user/list',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_user: true
      })
    ]),
    handler: async (req, res) => {

      // Get user list from ACL.
      var rows = await env.acl(`
      SELECT
        email,
        verified,
        approved,
        admin_user,
        admin_workspace,
        roles,
        access_log[array_upper(access_log, 1)],
        failedattempts,
        approved_by,
        blocked
      FROM acl_schema.acl_table;`);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);

    }
  });

};