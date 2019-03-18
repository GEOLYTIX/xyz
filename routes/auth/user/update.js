module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/auth/user/update',
    preHandler: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, { lv: 'admin', API: true })
    ]),
    handler: async (req, res) => {

      const token = await fastify.jwt.decode(req.query.token);

      const email = req.query.email.replace(/\s+/g,'');

      // Get user to update from ACL.
      var rows = await global.pg.users(`
      UPDATE acl_schema.acl_table
      SET
        ${req.query.role} = ${req.query.chk},
        approved_by = '${token.email}'
      WHERE lower(email) = lower($1);`,
      [email]);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      // Send email to the user account if an account has been approved.
      if (req.query.role === 'approved' && req.query.chk)
        await require(global.appRoot + '/mod/mailer')({
          to: email,
          subject: `This account has been approved for ${global.alias || req.headers.host}${global.dir}`,
          text: `You are now able to log on to ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}`
        });
  
      return res.code(200).send();
    }
  });

};