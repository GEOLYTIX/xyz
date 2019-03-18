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
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
        public: global.public
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/',
    handler: (req, res) => require(global.appRoot + '/routes/auth/login').post(req, res, fastify)
  });

};

async function view(req, res, token = { access: 'public' }) {

  const config = global.workspace['admin'].config;

  // Check whether request comes from a mobile platform and set template.
  const md = new Md(req.headers['user-agent']);

  const tmpl = (md.mobile() === null || md.tablet() !== null) ?
    jsr.templates('./public/views/desktop.html') :
    jsr.templates('./public/views/mobile.html');

  // Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: global.dir,
    title: config.title || 'GEOLYTIX | XYZ',
    user: token.email || 'anon',
    nanoid: nanoid(6),
    token: req.query.token || token.signed,
    log: process.env.LOG_LEVEL ? 'true' : 'false',
    btnDocumentation: config.documentation ? '' : 'style="display: none;"',
    hrefDocumentation: config.documentation ? config.documentation : '',
    btnLogin: process.env.PRIVATE || process.env.PUBLIC ? '' : 'style="display: none;"',
    btnLogin_style: token.email ? 'face' : 'lock_open',
    btnLogin_path: token.email ? '' : '/login',
    btnLogin_text: token.email ? token.email : 'anonymous (public)',
    btnAdmin: token.admin ? '' : 'style="display: none;"',
    btnEditor: token.editor ? '' : 'style="display: none;"',
    logrocket: global.logrocket || '""',
  }));

};