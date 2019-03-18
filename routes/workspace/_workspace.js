module.exports = fastify => {

  require('./admin').route(fastify);

  require('./get')(fastify);

  require('./load')(fastify);

};