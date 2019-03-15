module.exports = { route, view };

function route(fastify, authToken) {

  fastify.route({
    method: 'GET',
    url: '/auth/user/admin',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: 'admin', API: false })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/auth/user/admin',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

  fastify.route({
    method: 'GET',
    url: '/auth/user/list',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: 'admin', API: false })
    ]),
    handler: async (req, res) => {

      // Get user list from ACL.
      var rows = await global.pg.users(`
      SELECT
        email,
        verified,
        approved,
        admin,
        editor,
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

async function view(req, res, token) {

  const template = require('jsrender')
    .templates('./public/views/user_admin.html')
    .render({
      dir: global.dir,
      token: token.signed
    });

  res
    .type('text/html')
    .send(template);

}