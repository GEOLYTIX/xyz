const env = require('../mod/env');

const template = require('backtick-template');

const fetch = require('node-fetch');

module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/desktop',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: view
  });

};

async function view(req, res, token = { access: 'public' }) {

  const tmpl = await fetch(env.desktop || `${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${env.path}/views/desktop.html`);

  const html = template(await tmpl.text(), {
    dir: env.path,
    token: req.query.token || token.signed || '""',
  })

  //Build the template with jsrender and send to client.
  res.type('text/html').send(html);

};