module.exports = (fastify, authToken) => {

  require('./login').route(fastify);
   
  require('./register')(fastify);

  // token
  
  require('./token/api').route(fastify, authToken);

  // user

  require('./user/admin').route(fastify, authToken);

  require('./user/approve').route(fastify, authToken);

  require('./user/block').route(fastify, authToken);

  require('./user/delete')(fastify, authToken);

  require('./user/update')(fastify, authToken);

  require('./user/verify')(fastify, authToken);

  require('./user/log')(fastify, authToken);
    
};