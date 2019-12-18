const env = require('../mod/env');

const fetch = require('../mod/fetch');

const _fetch = require('node-fetch');

const transformDate = require('../mod/date');

const mailer = require('../mod/mailer');

const bcrypt = require('bcrypt-nodejs');

const crypto = require('crypto');

const root = require('../routes/root');

const template = require('backtick-template');

module.exports = fastify => {

  return {
    route: route,
    view: view,
    post: post
  };

  function route(fastify) {

    fastify.route({
      method: 'GET',
      url: '/login',
      handler: view
    });

    fastify.route({
      method: 'POST',
      url: '/login',
      handler: post
    });

  }

  async function post(req, res, access = {}) {

    if (env.captcha && env.captcha[1]) {

      const captcha_verification = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${env.captcha[1]}&response=${req.body.captcha}&remoteip=${req.req.ips.pop()}`);

      if (captcha_verification.score < 0.6) return res.redirect(env.path + '/login?msg=fail');

    }

    if (!req.body.email) return;

    if (!req.body.password) return;

    const date = transformDate();

    var q = `
      UPDATE acl_schema.acl_table
      SET access_log = array_append(access_log, '${date}@${req.req.ips.pop() || req.req.ip}')
      WHERE lower(email) = lower($1)
      RETURNING *;`;

    var rows = await env.acl(q, [req.body.email]);

    if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');

    // Get user record from first row.
    const user = rows[0];

    if (user && user.blocked) return res.redirect(env.path + '/login?msg=fail');

    // Redirect back to login (get) with error msg if user is not found.
    if (!user) return res.redirect(env.path + '/login?msg=fail');

    if (access.admin_user && !user.admin_user) return res.redirect(env.path + '/login?msg=fail');

    if (access.admin_workspace && !user.admin_workspace) return res.redirect(env.path + '/login?msg=fail');

    // Redirect back to login (get) with error msg if user is not valid.
    if (!user.verified || !user.approved) {

      // Sent fail mail when to account email if login failed.
      mailer({
        to: user.email,
        subject: `A failed login attempt was made on ${env.alias || req.headers.host}${env.path}`,
        text: `${user.verified ? 'The account has been verified. \n \n' : 'The account has NOT been verified. \n \n'}`
          + `${user.approved ? 'The account has been approved. \n \n' : 'Please wait for account approval confirmation email. \n \n'}`
          + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
          + 'This wasn\'t you? Please let your manager know. \n \n'
      });

      return res.redirect(env.path + '/login?msg=fail');
    }

    // Check password from post body against encrypted password from ACL.
    if (bcrypt.compareSync(req.body.password, user.password)) {

      // Create token with 8 hour expiry.
      const token = {
        email: user.email,
        admin_user: user.admin_user,
        admin_workspace: user.admin_workspace,
        roles: user.roles
      };

      token.signed = fastify.jwt.sign(token, { expiresIn: 28800 });

      if (access.view) return access.view(req, res, token);

      return root.view(req, res, token);

      // Password from login form does NOT match encrypted password in ACL!
    } else {

      // Increase failed login attempts counter by 1 for user in ACL.
      rows = await env.acl(`
        UPDATE acl_schema.acl_table
        SET failedattempts = failedattempts + 1
        WHERE lower(email) = lower($1)
        RETURNING failedattempts;`,
        [req.body.email]);

      if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');

      // Check whether failed login attempts exceeds limit.
      if (rows[0].failedattempts >= env.failed_attempts) {

        // Create a new verification token and remove verified status in ACL.
        const verificationtoken = crypto.randomBytes(20).toString('hex');

        // Store new verification token in ACL.
        rows = await env.acl(`
          UPDATE acl_schema.acl_table
          SET
            verified = false,
            verificationtoken = '${verificationtoken}'
          WHERE lower(email) = lower($1);`,
          [req.body.email]);

        if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');

        // Sent email with verification link to user.
        mailer({
          to: user.email,
          subject: `Too many failed login attempts occured on ${env.alias || req.headers.host}${env.path}`,
          text: `${env.failed_attempts} failed login attempts have been recorded on this account. \n \n`
            + 'This account has now been locked until verified. \n \n'
            + `Please verify that you are the account holder: ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}/user/verify/${verificationtoken} \n \n`
            + 'Verifying the account will reset the failed login attempts. \n \n'
            + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
            + 'This wasn\'t you? Please let your manager know. \n \n'
        });

        // Failed login attempts have not yet exceeded limit.
      } else {

        // Sent fail mail.
        mailer({
          to: user.email,
          subject: `A failed login attempt was made on ${env.alias || req.headers.host}${env.path}`,
          text: 'An incorrect password was entered! \n \n'
            + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
            + 'This wasn\'t you? Please let your manager know. \n \n'
        });
      }

      return res.redirect(env.path + '/login?msg=fail');
    }

  }

  async function view(req, res) {

    // Fail messaged to be displayed for msg query parameter in redirect.
    const msgs = {
      fail: 'Login has failed.<br />'
        + 'This may be due to insufficient priviliges or the account being locked.<br />'
        + 'Please check your inbox for an email with additional details.',
      validation: 'Please check your inbox for an email with additional details.',
      reset: 'The password has been reset for this account.',
      approval: 'This account has been verified but requires administrator approval.',
      badconfig: 'There seems to be a problem with the ACL configuration.'
    };

    const tmpl = await _fetch(`${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${env.path}/views/login.html`)

    const html = template(await tmpl.text(), {
      dir: env.path,
      action: req.req.url,
      msg: req.query.msg ? msgs[req.query.msg] : ' ',
      captcha: env.captcha && env.captcha[0] || '',
    });

    // Send login view to client.
    res.type('text/html').send(html);

  }

};