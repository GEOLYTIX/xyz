module.exports = {route, view};

// Create constructor for mobile detect module.
const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/',
    beforeHandler: fastify.auth([fastify.authAccess]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token = { access: 'public' }) {

  const config = global.workspace[token.access].config;

  // Check whether request comes from a mobile platform and set template.
  const md = new Md(req.headers['user-agent']);

  const tmpl = (md.mobile() === null || md.tablet() !== null) ?
    jsr.templates('./public/views/desktop.html') :
    jsr.templates('./public/views/mobile.html');

  // Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: global.dir,
    title: config.title || 'GEOLYTIX | XYZ',
    nanoid: nanoid(6),
    token: token.signed,
    log: process.env.LOG_LEVEL ? 'data-log = true' : '',
    bundle_js: 'build/xyz_bundle.js',
    btnDocumentation: config.documentation ? '' : 'style="display: none;"',
    hrefDocumentation: config.documentation ? config.documentation : '',
    btnLogin: process.env.PRIVATE || process.env.PUBLIC ? '' : 'style="display: none;"',
    btnLogin_style: token.email ? 'face' : 'lock_open',
    btnLogin_path: token.email ? '' : '/login',
    btnLogin_text: token.email ? token.email : 'anonymous (public)',
    btnAdmin: token.access === 'admin' ? '' : 'style="display: none;"'
  }));

};