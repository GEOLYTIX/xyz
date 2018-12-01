module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/register',
    handler: (req, res) => {
      res
        .type('text/html')
        .send(require('jsrender')
          .templates('./public/views/register.html')
          .render({ dir: global.dir }));
    }
  });
  
  fastify.route({
    method: 'POST',
    url: '/register',
    handler: async (req, res) => {
  
      const email = req.body.email;
  
      // Backend validation of email address.
      if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
  
        return res.redirect(global.dir + '/login?msg=validation');
      }
  
      var rows = await global.pg.users(`
      SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`,
      [email]);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      const user = rows[0];
      const password = require('bcrypt-nodejs').hashSync(req.body.password, require('bcrypt-nodejs').genSaltSync(8));
      const verificationtoken = require('crypto').randomBytes(20).toString('hex');
  
      // Set password for existing user and remove existing verification.
      if (user) {
  
        rows = await global.pg.users(`
        UPDATE acl_schema.acl_table SET
          password_reset = '${password}',
          verificationtoken = '${verificationtoken}'
        WHERE lower(email) = lower($1);`,
        [email]);
    
        if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
        require(global.appRoot + '/mod/mailer')({
          to: user.email,
          subject: `Please verify your password reset for ${global.alias || req.headers.host}${global.dir}`,
          text: 'A new password has been set for this account. \n \n'
                + `Please verify that you are the account holder: ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}/auth/user/verify/${verificationtoken} \n \n`
                + `The reset occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                + 'This wasn\'t you? Please let your manager know. \n \n'
        });
  
        return res.redirect(global.dir + '/login?msg=validation');
      }
  
      // Create new user account
      rows = await global.pg.users(`
      INSERT INTO acl_schema.acl_table (email, password, verificationtoken)
      SELECT
        '${email}' AS email,
        '${password}' AS password,
        '${verificationtoken}' AS verificationtoken;`);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      require(global.appRoot + '/mod/mailer')({
        to: email,
        subject: `Please verify your account on ${global.alias || req.headers.host}${global.dir}`,
        text: `A new account for this email address has been registered with ${global.alias || req.headers.host}${global.dir} \n \n`
                + `Please verify that you are the account holder: ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}/auth/user/verify/${verificationtoken} \n \n`
                + 'A site administrator must approve the account before you are able to login. \n \n'
                + 'You will be notified via email once an adimistrator has approved your account. \n \n'
                + `The account was registered from this remote address ${req.req.connection.remoteAddress} \n \n`
                + 'This wasn\'t you? Do NOT verify the account and let your manager know. \n \n'
  
      });
  
      return res.redirect(global.dir + '/login?msg=validation');
  
    }
  });

};