const env = require('../mod/env');

// Create constructor for mobile detect module.
const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

const fetch = require('node-fetch');

module.exports = {route, view};

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/view',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: view
  });

};

async function view(req, res, token = { access: 'public' }) {

  // Check whether request comes from a mobile platform and set template.
  const md = new Md(req.headers['user-agent']);

  const _tmpl = (md.mobile() === null || md.tablet() !== null) ?
    await fetch(`${env.http || 'https'}://${req.headers.host}${env.path}/views/desktop_custom.html`) :
    await fetch(`${env.http || 'https'}://${req.headers.host}${env.path}/views/mobile.html`);

  const tmpl = jsr.templates('tmpl', await _tmpl.text());

  //Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({dir: env.path}));

};