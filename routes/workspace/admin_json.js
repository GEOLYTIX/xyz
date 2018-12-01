// Open workspace admin interface (json view).
module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/workspace/admin/json',
    beforeHandler: fastify.auth([fastify.authAdmin]),
    handler: (req, res) => {
        
      // Render and send admin template with 'code' as view mode.
      res.type('text/html').send(require('jsrender').templates('./public/views/workspace_admin.html').render({
        dir: global.dir,
        mode: 'code'
      }));
      
    }
  });
};