const env = require('../mod/env');

module.exports = { route, view };

function route(fastify) {
    
  fastify.route({
    method: 'GET',
    url: '/token',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/token',
    handler: (req, res) => fastify.login.post(req, res, {
      view: (req, res, token) => view(req, res, token, fastify)
    })
  });

};

async function view(req, res, token, fastify) {

  // Get user from ACL.
  var rows = await env.acl(`
    SELECT * FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`,
  [token.email]);
    
  if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');
  
  const user = rows[0];
  
  if (!user
    || !user.verified
    || !user.approved
    || user.blocked) return res.code(401).send(new Error('Invalid token'));
  
  // Create signed api_token
  const api_token = fastify.jwt.sign({
    email: user.email,
    roles: [],
    api: true
  });
  
    // Store api_token in ACL.
  var rows = await env.acl(`
    UPDATE acl_schema.acl_table SET api = '${api_token}'
    WHERE lower(email) = lower($1);`,
  [user.email]);
    
  if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');
  
  // Send ACL token.
  res.send(api_token);

}