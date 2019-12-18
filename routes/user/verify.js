const env = require('../../mod/env');

const mailer = require('../../mod/mailer');

const crypto = require('crypto');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/user/verify/:token',
    handler: async (req, res) => {
  
      // Find user account in ACL from matching token.
      var rows = await env.acl(`
      SELECT * FROM acl_schema.acl_table WHERE verificationtoken = $1;`,
      [req.params.token]);
  
      if (rows.err) return res.send('There seems to be a problem with the ACL configuration.');
  
      const user = rows[0];
  
      if (!user) return res.send('Token not found.');
  
      const approvaltoken = crypto.randomBytes(20).toString('hex');
  
      // Update user account in ACL.
      rows = await env.acl(`
      UPDATE acl_schema.acl_table SET
        failedattempts = 0,
        ${user.password_reset ? `password = '${user.password_reset}', password_reset = null,` : ''}
        verified = true,
        ${!user.approved ? `approvaltoken = '${approvaltoken}',` : ''}
        verificationtoken = null
      WHERE lower(email) = lower($1);`,
      [user.email]);
  
      if (rows.err) return res.send('There seems to be a problem with the ACL configuration.');
  
      // Return on password reset; Do NOT notify administrator
      if (user.password_reset) return res.send(env.path + '/login?msg=reset');
  
      // Notify administrator if user needs to be approved.
      if (!user.approved) {
  
        // Get all admin accounts from the ACL.
        rows = await env.acl('SELECT email FROM acl_schema.acl_table WHERE admin_user = true;');
    
        if (rows.err) return res.send('There seems to be a problem with the ACL configuration.');
  
        if (rows.length === 0) return console.log('No admin accounts were found.');
  
        // Create an array of all admin account emails.
        let adminmail = rows.map(admin => admin.email);
  
        // Sent an email to all admin account emails with a request to approve the new user account.
        mailer({
          bcc: adminmail,
          subject: `A new account has been verified on ${env.alias || req.headers.host}${env.path}`,
          text: `Please log into the admin panel ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}/user/admin to approve ${user.email} \n \n`
              + `You can also approve the account by following this link: ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}/user/approve/${approvaltoken} \n \n`
              + `!!! If you do not recognize this email address consider blocking the account >>> ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}/user/block/${approvaltoken}`
        });
  
        return res.send('This account has been verified but requires administrator approval.');
      }
  
      res.redirect(env.path + '/login');
    }
    
  });

};