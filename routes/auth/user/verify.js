module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/auth/user/verify/:token',
    handler: async (req, res) => {
  
      // Find user account in ACL from matching token.
      var rows = await global.pg.users(`
      SELECT * FROM acl_schema.acl_table WHERE verificationtoken = $1;`,
      [req.params.token]);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      const user = rows[0];
  
      if (!user) return res.send('Token not found.');
  
      const approvaltoken = require('crypto').randomBytes(20).toString('hex');
  
      // Update user account in ACL.
      rows = await global.pg.users(`
      UPDATE acl_schema.acl_table SET
        failedattempts = 0,
        ${user.password_reset ? `password = '${user.password_reset}', password_reset = null,` : ''}
        verified = true,
        ${!user.approved ? `approvaltoken = '${approvaltoken}',` : ''}
        verificationtoken = null
      WHERE lower(email) = lower($1);`,
      [user.email]);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      // Return on password reset; Do NOT notify administrator
      if (user.password_reset) return res.redirect(global.dir + '/login?msg=reset');
  
      // Notify administrator if user needs to be approved.
      if (!user.approved) {
  
        // Get all admin accounts from the ACL.
        rows = await global.pg.users('SELECT email FROM acl_schema.acl_table WHERE admin = true;');
    
        if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
        if (rows.length === 0) return console.log('No admin accounts were found.');
  
        // Create an array of all admin account emails.
        let adminmail = rows.map(admin => admin.email);
  
        // Sent an email to all admin account emails with a request to approve the new user account.
        require(global.appRoot + '/mod/mailer')({
          bcc: adminmail,
          subject: `A new account has been verified on ${global.alias || req.headers.host}${global.dir}`,
          text: `Please log into the admin panel ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}/auth/user/admin to approve ${user.email} \n \n`
                + `You can also approve the account by following this link: ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}/auth/user/approve/${approvaltoken}`
        });
  
        return res.redirect(global.dir + '/login?msg=approval');
      }
  
      res.redirect(global.dir + '/login');
    }
  });

};