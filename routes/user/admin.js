const env = require('../../mod/env');

const template = require('backtick-template');

const fetch = require('node-fetch');

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

  const tmpl = await fetch(`${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${env.path}/views/user.html`);

  const html = template(await tmpl.text(), {
    dir: env.path,
    token: token.signed
  });

  res.type('text/html').send(html);

}