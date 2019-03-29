module.exports = { route, view };

function route(fastify) {
    
  fastify.route({
    method: 'GET',
    url: '/token',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/token',
    handler: (req, res) => require(global.appRoot + '/routes/login')
      .post(req, res, fastify)
  });

};

async function view(req, res, token, fastify) {

  // Get user from ACL.
  var rows = await global.pg.users(`
    SELECT * FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`,
  [token.email]);
    
  if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
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
  var rows = await global.pg.users(`
    UPDATE acl_schema.acl_table SET api = '${api_token}'
    WHERE lower(email) = lower($1);`,
  [user.email]);
    
  if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');
  
  // Send ACL token.
  res.send(api_token);

}