module.exports = {route, view};

// Create constructor for mobile detect module.
// const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/report',
    preHandler: fastify.auth([fastify.authAccess]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/report',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token = { access: 'public' }) {

  const config = global.workspace[token.access].config;

  // Check whether request comes from a mobile platform and set template.
  // const md = new Md(req.headers['user-agent']);

  const tmpl = jsr.templates('./public/views/report.html');

  let html = await require('fs').readFileSync(`${global.appRoot}/public/views/report/${req.query.template}.html`, 'utf8');

  // Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: global.dir,
    title: config.title || 'GEOLYTIX | XYZ',
    nanoid: nanoid(6),
    token: req.query.token || token.signed,
    template: html || null,
    script_js: 'views/report.js'
  }));
};