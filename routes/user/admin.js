const env = require(global.__approot + '/mod/env');

const jsr = require('jsrender');

module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/user/admin',
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
    url: '/user/admin',
    handler: (req, res) => fastify.login.post(req, res, {
      admin_user: true,
      view: view
    })
  });

};

async function view(req, res, token) {

  const template = jsr
    .templates('./public/views/user.html')
    .render({
      dir: env.path,
      token: token.signed
    });

  res
    .type('text/html')
    .send(template);

}