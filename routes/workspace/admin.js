module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/workspace/admin',
    beforeHandler: fastify.auth([fastify.authAdmin]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/workspace/admin',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token) {

  // Render and send admin template with 'tree' as view mode.
  res.type('text/html').send(require('jsrender').templates('./public/views/workspace_admin.html').render({
    dir: global.dir,
    mode: 'tree',
    token: token.signed
  }));

}