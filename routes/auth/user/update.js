module.exports = fastify => {
    
  fastify.route({
    method: 'POST',
    url: '/auth/user/update',
    beforeHandler: fastify.auth([fastify.authAdminAPI]),
    handler: async (req, res) => {

      const email = req.body.email.replace(/\s+/g,'');
  
      // Get user to update from ACL.
      var rows = await global.pg.users(`
      UPDATE acl_schema.acl_table SET ${req.body.role} = ${req.body.chk}
      WHERE lower(email) = lower($1);`,
      [email]);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      // Send email to the user account if an account has been approved.
      if (req.body.role === 'approved' && req.body.chk)
        await require(global.appRoot + '/mod/mailer')({
          to: email,
          subject: `This account has been approved for ${global.alias || req.headers.host}${global.dir}`,
          text: `You are now able to log on to ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}`
        });
  
      return res.code(200).send();
    }
  });

};