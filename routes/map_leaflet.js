// Create constructor for mobile detect module.
// const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');
  
module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/map/leaflet',
    beforeHandler: fastify.auth([fastify.authAccess]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      let config = global.workspace[token.access].config;

      // Check whether request comes from a mobile platform and set template.
      // let md = new Md(req.headers['user-agent']);

      let tmpl = jsr.templates('./public/views/map.html');

      // Build the template with jsrender and send to client.
      res.type('text/html').send(tmpl.render({
        dir: global.dir,
        title: config.title || 'GEOLYTIX | XYZ',
        nanoid: nanoid(6),
        bundle_js: 'build/map_leaflet_bundle.js'
      }));
    }
  });
};