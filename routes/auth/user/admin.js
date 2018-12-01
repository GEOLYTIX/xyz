module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/auth/user/admin',
    beforeHandler: fastify.auth([fastify.authAdmin]),
    handler: async (req, res) => {

      // Get user list from ACL.
      var rows = await global.pg.users(`
      SELECT email, verified, approved, admin, failedattempts FROM acl_schema.acl_table;`);

      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

      res
        .type('text/html')
        .send(require('jsrender')
          .templates('./public/views/admin.html')
          .render({
            users: rows,
            dir: global.dir
          })
        );
    }
  });

};