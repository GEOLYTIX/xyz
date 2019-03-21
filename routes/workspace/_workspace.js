module.exports = fastify => {

  require('./get')(fastify);

  require('./load')(fastify);

};