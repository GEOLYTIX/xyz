const env = require('../mod/env');

const jsr = require('jsrender');

const fetch = require('node-fetch');

module.exports = {route, view};

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/iframe',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: view
  });

};

async function view(req, res, token = { access: 'public' }) {

  const _tmpl = await fetch(env.desktop || `${env.http || 'https'}://${req.headers.host}${env.path}/views/iframe.html`);

  const tmpl = jsr.templates('tmpl', await _tmpl.text());

  //Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: env.path,
    token: req.query.token || token.signed || '""',
  }));

};