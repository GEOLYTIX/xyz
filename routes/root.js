// Create constructor for mobile detect module.
const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');
  
module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/',
    beforeHandler: fastify.auth([fastify.authAccess]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      let config = global.workspace[token.access].config;

      // Check whether request comes from a mobile platform and set template.
      let md = new Md(req.headers['user-agent']);

      let tmpl = (md.mobile() === null || md.tablet() !== null) ?
        jsr.templates('./public/views/desktop.html') :
        jsr.templates('./public/views/mobile.html');

      // Build the template with jsrender and send to client.
      res.type('text/html').send(tmpl.render({
        dir: global.dir,
        title: config.title || 'GEOLYTIX | XYZ',
        nanoid: nanoid(6),
        log: process.env.LOG_LEVEL ? 'data-log = true' : '',
        bundle_js: 'build/xyz_bundle.js',
        btnDocumentation: config.documentation ? '' : 'style="display: none;"',
        hrefDocumentation: config.documentation ? config.documentation : '',
        btnLogin: process.env.PRIVATE || process.env.PUBLIC ? '' : 'style="display: none;"',
        btnLogin_style: token.email ? 'face' : 'lock_open',
        btnLogin_text: token.email ? token.email : 'anonymous (public)',
        btnAdmin: token.access === 'admin' ? '' : 'style="display: none;"',
        btnLocate: config.locate ? '' : 'style="display: none;"'
      }));
    }
  });
};