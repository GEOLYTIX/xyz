module.exports = fastify => {

  require('./root').route(fastify);

  require('./proxy_request')(fastify);

  require('./api/_api')(fastify);

  require('./auth/_auth')(fastify);

  require('./workspace/_workspace')(fastify);

  require('./map_leaflet').route(fastify);

  require('./report').route(fastify);

};