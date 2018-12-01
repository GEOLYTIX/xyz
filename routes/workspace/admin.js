// Open workspace admin interface (tree view).
module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/workspace/admin',
    beforeHandler: fastify.auth([fastify.authAdmin]),
    handler: (req, res) => {
        
      // Render and send admin template with 'tree' as view mode.
      res.type('text/html').send(require('jsrender').templates('./public/views/workspace_admin.html').render({
        dir: global.dir,
        mode: 'tree'
      }));
      
    }
  });
};