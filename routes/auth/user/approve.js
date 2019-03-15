module.exports = { route, view };

function route(fastify, authToken) {
    
  fastify.route({
    method: 'GET',
    url: '/auth/user/approve/:token',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: 'admin', API: false })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/auth/user/approve/:token',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token) {

  var rows = await global.pg.users(`
  SELECT * FROM acl_schema.acl_table WHERE approvaltoken = $1;`,
  [req.params.token]);

  if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

  const user = rows[0];

  if (!user) return res.send('Token not found. The token has probably been resolved already.');

  rows = await global.pg.users(`
  UPDATE acl_schema.acl_table SET
    approved = true,
    approvaltoken = null,
    approved_by = '${token.email}'
  WHERE lower(email) = lower($1);`,
  [user.email]);

  if (rows.err) return res.redirect(global.dir + '/login?msg=badconfig');

  require(global.appRoot + '/mod/mailer')({
    to: user.email,
    subject: `This account has been approved on ${global.alias || req.headers.host}${global.dir}`,
    text: `You are now able to log on to ${process.env.HTTP || 'https'}://${global.alias || req.headers.host}${global.dir}`
  });

  res.send('The account has been approved by you. An email has been sent to the account holder.');

}