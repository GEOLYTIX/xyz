module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/auth/user/admin',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        admin: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/auth/user/admin',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login')
      .post(req, res, fastify, { admin: true })
  });

  fastify.route({
    method: 'GET',
    url: '/auth/user/list',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        admin: true
      })
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
    .templates('./public/views/user.html')
    .render({
      dir: global.dir,
      token: token.signed
    });

  res
    .type('text/html')
    .send(template);

}