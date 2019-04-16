module.exports = fastify => {

  require('./root').route(fastify);

  fastify.login.route(fastify);
  
  require('./register')(fastify);

  require('./token').route(fastify);

  require('./proxy_request')(fastify);

  require('./report').route(fastify);

  require('./api/_api')(fastify);

  require('./user/_user')(fastify);

  require('./workspace/_workspace')(fastify);

  require('./stream').route(fastify);

};