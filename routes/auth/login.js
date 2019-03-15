module.exports = {route, view, post};

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/login',
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    handler: (req, res) => post(req, res, fastify)
  });

}

async function post(req, res, fastify) {

  if (global.captcha && global.captcha[1]) {

    const captcha_verification = await require(global.appRoot + '/mod/fetch')(`https://www.google.com/recaptcha/api/siteverify?secret=${global.captcha[1]}&response=${req.body.captcha}&remoteip=${req.req.ips.pop()}`);
  
    if (captcha_verification.score < 0.6) return res.redirect(global.dir + '/login?msg=fail');

  }

  if (!req.body.email) return;

  if (!req.body.password) return;

  const date = require(global.appRoot + '/mod/date')();

  var q = `
  UPDATE acl_schema.acl_table
  SET
    access_log = array_append(access_log, '${date}@${req.req.ips.pop()||req.req.ip}')
  WHERE lower(email) = lower($1)
  RETURNING *;`;

  var rows = await global.pg.users(q, [req.body.email]);

  if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

  // Get user record from first row.
  const user = rows[0];

  if (user && user.blocked) return res.redirect(global.dir + '/login?msg=fail');

  // Redirect back to login (get) with error msg if user is not found.
  if (!user) return res.redirect(global.dir + '/login?msg=fail');

  // Redirect back to login (get) with error msg if user is not valid.
  if (!user.verified || !user.approved) {

    // Sent fail mail when to account email if login failed.
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

    // Create token with 8 hour expiry.
    const token = {
      email: user.email,
      access: user.admin ? 'admin' : 'private',
      admin: user.admin,
      editor: user.editor,
      roles: user.roles
    };
    
    token.signed = fastify.jwt.sign(token, { expiresIn: 28800 });

    // Return leaflet map control view.
    if(/\/map\/leaflet/.test(req.headers.referer)) return require(global.appRoot + '/routes/map_leaflet').view(req, res, token);

    // Return leaflet map control view.
    if(/\/report/.test(req.headers.referer)) return require(global.appRoot + '/routes/report').view(req, res, token);

    // Return API key.
    if(/\/auth\/token\/api/.test(req.headers.referer)) return require(global.appRoot + '/routes/auth/token/api').view(req, res, token, fastify);

    // Return user admin view.
    if(/\/auth\/user\/admin/.test(req.headers.referer)) return require(global.appRoot + '/routes/auth/user/admin').view(req, res, token);

    // Approve user.
    if(/\/auth\/user\/approve/.test(req.headers.referer)) return require(global.appRoot + '/routes/auth/user/approve').view(req, res, token);

    // Block user.
    if(/\/auth\/user\/block/.test(req.headers.referer)) return require(global.appRoot + '/routes/auth/user/block').view(req, res, token);

    // Return workspace admin json view.
    if(/\/workspace\/admin\/json/.test(req.headers.referer)) return require(global.appRoot + '/routes/workspace/admin_json').view(req, res, token);

    // Return workspace admin view.
    if(/\/workspace\/admin/.test(req.headers.referer)) return require(global.appRoot + '/routes/workspace/admin').view(req, res, token);

    // Return root view.
    require(global.appRoot + '/routes/root').view(req, res, token);


  // Password from login form does NOT match encrypted password in ACL!
  } else {

    // Increase failed login attempts counter by 1 for user in ACL.
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

      // Store new verification token in ACL.
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

    // Failed login attempts have not yet exceeded limit.
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

async function view(req, res) {

  // Fail messaged to be displayed for msg query parameter in redirect.
  const msgs = {
    fail: 'Login has failed.<br />'
      + 'This may be due to insufficient priviliges or the account being locked.<br />'
      + 'More details will have been sent via mail to prevent user enumeration.',
    validation: 'Please check your inbox for an email with additional details.',
    reset: 'The password has been reset for this account.',
    approval: 'This account has been verified but requires administrator approval.',
    badconfig: 'There seems to be a problem with the ACL configuration.'
  };
  
  // Send login view to client.
  res
    .type('text/html')
    .send(require('jsrender')
      .templates('./public/views/login.html')
      .render({
        dir: global.dir,
        action: req.req.url,
        msg: req.query.msg ? msgs[req.query.msg] : null,
        captcha: global.captcha && global.captcha[0],
      }));  

}