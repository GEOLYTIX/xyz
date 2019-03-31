module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/user/delete',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_user: true
      })
    ]),
    handler: async (req, res) => {

      const email = req.query.email.replace(/\s+/g,'');

      // Delete user account in ACL.
      var rows = await global.pg.users(`
      DELETE FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [email]);

      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

      // Sent email to inform user that their account has been deleted.
      await require(global.appRoot + '/mod/mailer')({
        to: email,
        subject: `This ${global.alias || req.headers.host}${global.dir} account has been deleted.`,
        text: `You will no longer be able to log in to ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}`
      });

      res.code(200).send('User account deleted.');

    }
  });

};