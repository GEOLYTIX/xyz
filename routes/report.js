const env = require(global.__approot + '/mod/env');

module.exports = {route, view};

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/report',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true,
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/report',
    handler: (req, res) => fastify.login.post(req, res, {
      view: view
    })
  });

};

async function view(req, res, token = { access: 'public' }) {

  const tmpl = jsr.templates('./public/views/report.html');

  let html = await require('fs').readFileSync(`${global.__approot}/public/views/report/${req.query.template}.html`, 'utf8');

  // Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: env.path,
    title: env.workspace.title || 'GEOLYTIX | XYZ',
    nanoid: nanoid(6),
    token: req.query.token || token.signed || '""',
    template: html || null,
    script_js: 'views/report.js'
  }));
};