module.exports = fastify => {

  require('./root').route(fastify);

  require('./login').route(fastify);
  
  require('./register')(fastify);

  require('./token').route(fastify);

  require('./proxy_request')(fastify);

  require('./report').route(fastify);

  require('./api/_api')(fastify);

  require('./user/_user')(fastify);

  require('./workspace/_workspace')(fastify);

  require('./map_leaflet').route(fastify);



};