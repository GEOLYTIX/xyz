module.exports = (fastify, authToken) => {

  require('./admin').route(fastify, authToken);

  require('./admin_json').route(fastify, authToken);

  require('./get')(fastify, authToken);

  require('./load')(fastify, authToken);

};