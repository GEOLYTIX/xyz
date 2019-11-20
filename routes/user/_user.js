module.exports = fastify => {

  require('./admin').route(fastify);

  require('./approve').route(fastify);

  require('./block').route(fastify);

  require('./delete')(fastify);

  require('./update')(fastify);

  require('./verify')(fastify);

  require('./log')(fastify);

  require('./list')(fastify);
    
};