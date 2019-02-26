module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/auth/user/admin',
    preHandler: fastify.auth([fastify.authAdmin]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/auth/user/admin',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token) {

  // Get user list from ACL.
  var rows = await global.pg.users(`
        SELECT
          email,
          verified,
          approved,
          admin,
          failedattempts
        FROM acl_schema.acl_table;
      `);

  if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

  res
    .type('text/html')
    .send(require('jsrender')
      .templates('./public/views/user_admin.html')
      .render({
        users: rows,
        dir: global.dir,
        token: token.signed
      })
    );

}