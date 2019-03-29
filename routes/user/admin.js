module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/user/admin',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        admin_user: true,
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/user/admin',
    handler: (req, res) => require(global.appRoot + '/routes/login')
      .post(req, res, fastify, {
        admin_user: true
      })
  });

};

async function view(req, res, token) {

  const template = require('jsrender')
    .templates('./public/views/user.html')
    .render({
      dir: global.dir,
      token: token.signed
    });

  res
    .type('text/html')
    .send(template);

}