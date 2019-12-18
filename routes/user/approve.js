const env = require('../../mod/env');

const mailer = require('../../mod/mailer');

module.exports = { route, view };

function route(fastify) {
    
  fastify.route({
    method: 'GET',
    url: '/user/approve/:token',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_user: true,
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/user/approve/:token',
    handler: (req, res) => fastify.login.post(req, res, {
      admin_user: true,
      view: view
    })
  });

};

async function view(req, res, token) {

  var rows = await env.acl(`
  SELECT * FROM acl_schema.acl_table WHERE approvaltoken = $1;`,
  [req.params.token]);

  if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');

  const user = rows[0];

  if (!user) return res.send('Token not found. The token has probably been resolved already.');

  rows = await env.acl(`
  UPDATE acl_schema.acl_table SET
    approved = true,
    approvaltoken = null,
    approved_by = '${token.email}'
  WHERE lower(email) = lower($1);`,
  [user.email]);

  if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');

  mailer({
    to: user.email,
    subject: `This account has been approved on ${env.alias || req.headers.host}${env.path}`,
    text: `You are now able to log on to ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}`
  });

  res.send('The account has been approved by you. An email has been sent to the account holder.');

}