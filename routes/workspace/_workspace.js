module.exports = fastify => {
  require('./admin')(fastify);
  require('./admin_json')(fastify);
  require('./get')(fastify);
  require('./load')(fastify);
};