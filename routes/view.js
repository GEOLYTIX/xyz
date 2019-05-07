const env = require('../mod/env');

// Create constructor for mobile detect module.
const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');

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
  res.type('text/html').send(tmpl.render({
    dir: env.path,
    title: env.workspace.title || 'GEOLYTIX | XYZ',
    user: token.email || '""',
    nanoid: nanoid(6),
    token: req.query.token || token.signed || '""',
    log: env.logs || '""',
    btnDocumentation: env.workspace.documentation ? '' : 'style="display: none;"',
    hrefDocumentation: env.workspace.documentation ? env.workspace.documentation : '',
    btnLogin: env.acl_connection ? '' : 'style="display: none;"',
    btnLogin_style: token.email ? 'face' : 'lock_open',
    btnLogin_path: token.email ? '' : '/login',
    btnLogin_text: token.email || 'anonymous (public)',
    btnAdmin: token.admin_user ? '' : 'style="display: none;"',
    btnEditor: token.admin_workspace ? '' : 'style="display: none;"',
    logrocket: env.logrocket || '""',
    btnLogRocket: env.logrocket ? '' : 'style="display: none;"',
  }));

};