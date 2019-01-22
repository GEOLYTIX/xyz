module.exports = fastify => {

  require('./admin').route(fastify);

  require('./admin_json').route(fastify);

  require('./get')(fastify);

  require('./load')(fastify);

};