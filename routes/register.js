const env = require(global.__approot + '/mod/env');

module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/register',
    handler: (req, res) => {
      res
        .type('text/html')
        .send(require('jsrender')
          .templates('./public/views/register.html')
          .render({
            dir: env.path,
            captcha: env.captcha && env.captcha[0],
          }));
    }
  });
  
  fastify.route({
    method: 'POST',
    url: '/register',
    handler: async (req, res) => {

      if (env.captcha && env.captcha[1]) {

        const captcha_verification = await require(global.__approot + '/mod/fetch')(`https://www.google.com/recaptcha/api/siteverify?secret=${env.captcha[1]}&response=${req.body.captcha}&remoteip=${req.req.ips.pop()}`);
      
        if (captcha_verification.score < 0.6) return res.redirect(env.path + '/login?msg=fail');
    
      }
  
      const email = req.body.email;
  
      // Backend validation of email address.
      if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
  
        return res.redirect(env.path + '/login?msg=validation');
      }
  
      var rows = await env.pg.users(`
      SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`,
      [email]);
  
      if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');
  
      const user = rows[0];
      const password = require('bcrypt-nodejs').hashSync(req.body.password, require('bcrypt-nodejs').genSaltSync(8));
      const verificationtoken = require('crypto').randomBytes(20).toString('hex');
  
      const date = require(global.__approot + '/mod/date')();

      // Set password for existing user and remove existing verification.
      if (user) {

        if (user.blocked) return res.redirect(env.path + '/login?msg=fail');
  
        rows = await env.pg.users(`
        UPDATE acl_schema.acl_table SET
          password_reset = '${password}',
          verificationtoken = '${verificationtoken}',
          access_log = array_append(access_log, '${date}@${req.req.ips.pop()||req.req.ip}')
        WHERE lower(email) = lower($1);`,
        [email]);
    
        if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');
  
        require(global.__approot + '/mod/mailer')({
          to: user.email,
          subject: `Please verify your password reset for ${env.alias || req.headers.host}${env.path}`,
          text: 'A new password has been set for this account. \n \n'
                + `Please verify that you are the account holder: ${env.http || 'https'}://${env.alias || req.headers.host}${env.path}/user/verify/${verificationtoken} \n \n`
                + `The reset occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                + 'This wasn\'t you? Please let your manager know. \n \n'
        });
  
        return res.redirect(env.path + '/login?msg=validation');
      }
  
      // Create new user account
      rows = await env.pg.users(`
      INSERT INTO acl_schema.acl_table (email, password, verificationtoken, access_log)
      SELECT
        '${email}' AS email,
        '${password}' AS password,
        '${verificationtoken}' AS verificationtoken,
        array['${date}@${req.req.ips.pop()||req.req.ip}'] AS access_log;`);
  
      if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');
  
      require(global.__approot + '/mod/mailer')({
        to: email,
        subject: `Please verify your account on ${env.alias || req.headers.host}${env.path}`,
        text: `A new account for this email address has been registered with ${env.alias || req.headers.host}${env.path} \n \n`
                + `Please verify that you are the account holder: ${env.http || 'https'}://${env.alias || req.headers.host}${env.path}/user/verify/${verificationtoken} \n \n`
                + 'A site administrator must approve the account before you are able to login. \n \n'
                + 'You will be notified via email once an adimistrator has approved your account. \n \n'
                + `The account was registered from this remote address ${req.req.connection.remoteAddress} \n \n`
                + 'This wasn\'t you? Do NOT verify the account and let your manager know. \n \n'
  
      });
  
      return res.redirect(env.path + '/login?msg=validation');
  
    }
  });

};