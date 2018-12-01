module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/login',
    handler: (req, res) => {
  
      const msgs = {
        fail: 'Login has failed.<br />'
              + 'This may be due to insufficient priviliges or the account being locked.<br />'
              + 'More details will have been sent via mail to prevent user enumeration.',
        validation: 'Please check your inbox for an email with additional details.',
        reset: 'The password has been reset for this account.',
        approval: 'This account has been verified but requires administrator approval.',
        badconfig: 'There seems to be a problem with the ACL configuration.'
      };
  
      res
        .type('text/html')
        .send(require('jsrender')
          .templates('./public/views/login.html')
          .render({
            dir: global.dir,
            action: req.req.url,
            msg: req.query.msg ? msgs[req.query.msg] : null
          }));
    }
  });
  
  fastify.route({
    method: 'POST',
    url: '/login',
    handler: async (req, res) => {
  
      if (!req.body.email) return;

      if (!req.body.password) return;
  
      var rows = await global.pg.users(`
      SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`,
      [req.body.email]);
  
      if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
      const user = rows[0];
  
      if (!user) return res.redirect(global.dir + '/login?msg=fail');
  
      if (!user.verified || !user.approved) {
  
        // Sent fail mail.
        require(global.appRoot + '/mod/mailer')({
          to: user.email,
          subject: `A failed login attempt was made on ${global.alias || req.headers.host}${global.dir}`,
          text: `${user.verified ? 'The account is verified. \n \n' : 'The account is NOT verified. \n \n'}`
                + `${user.approved ? 'The account is approved. \n \n' : 'The account is NOT approved. \n \n'}`
                + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                + 'This wasn\'t you? Please let your manager know. \n \n'
        });
  
        return res.redirect(global.dir + '/login?msg=fail');
      }
  
      // Check password from post body against encrypted password from ACL.
      if (require('bcrypt-nodejs').compareSync(req.body.password, user.password)) {
  
        // Create initial token which expires in 10 seconds.
        const token = fastify.jwt.sign({
          email: user.email,
          access: user.admin ? 'admin' : 'private'
        }, { expiresIn: 10 });
  
        // Attach token to redirect from query
        if (req.query.redirect) {
          let url = req.req.url.replace(global.dir + '/login?redirect=', ''),
            sign = url.indexOf('?') === -1 ? '?' : '&';
          return res.redirect(url + sign + 'token=' + token);
        }
  
        // Attach token
        return res.redirect(req.req.url
          .replace('login?', '?token=' + token + '&')
          .replace('login', '?token=' + token)
          .replace('/?', '?'));
  
      } else {
  
        rows = await global.pg.users(`
        UPDATE acl_schema.acl_table SET failedattempts = failedattempts + 1
        WHERE lower(email) = lower($1)
        RETURNING failedattempts;`,
        [req.body.email]);
    
        if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
        // Check whether failed login attempts exceeds limit.
        if (rows[0].failedattempts >= global.failed_attempts) {
  
          // Create a new verification token and remove verified status in ACL.
          const verificationtoken = require('crypto').randomBytes(20).toString('hex');
  
          rows = await global.pg.users(`
          UPDATE acl_schema.acl_table SET
            verified = false,
            verificationtoken = '${verificationtoken}'
          WHERE lower(email) = lower($1);`,
          [req.body.email]);
      
          if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
          // Sent email with verification link to user.
          require(global.appRoot + '/mod/mailer')({
            to: user.email,
            subject: `Too many failed login attempts occured on ${global.alias || req.headers.host}${global.dir}`,
            text: `${global.failed_attempts} failed login attempts have been recorded on this account. \n \n`
                  + 'This account has now been locked until verified. \n \n'
                  + `Please verify that you are the account holder: ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}/auth/user/verify/${verificationtoken} \n \n`
                  + 'Verifying the account will reset the failed login attempts. \n \n'
                  + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                  + 'This wasn\'t you? Please let your manager know. \n \n'
          });
  
        } else {
  
          // Sent fail mail.
          require(global.appRoot + '/mod/mailer')({
            to: user.email,
            subject: `A failed login attempt was made on ${global.alias || req.headers.host}${global.dir}`,
            text: 'An incorrect password was entered! \n \n'
                  + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                  + 'This wasn\'t you? Please let your manager know. \n \n'
          });
        }
  
        return res.redirect(global.dir + '/login?msg=fail');
      }
    }
  });

};