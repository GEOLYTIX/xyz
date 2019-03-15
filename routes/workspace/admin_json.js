module.exports = { route, view };

function route(fastify, authToken) {

  fastify.route({
    method: 'GET',
    url: '/workspace/admin/json',
    preHandler: fastify.auth([
      (req, res, done)=>authToken(req, res, done, { lv: 'admin', API: false })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/workspace/admin/json',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token) {

  // Render and send admin template with 'code' as view mode.
  res.type('text/html').send(require('jsrender').templates('./public/views/workspace_admin.html').render({
    dir: global.dir,
    mode: 'code',
    token: token.signed
  }));

}