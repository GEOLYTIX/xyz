module.exports = fastify => {

  require('./login').route(fastify);
   
  require('./register')(fastify);

  // token
  
  require('./token/api')(fastify);

  // user

  require('./user/admin').route(fastify);

  require('./user/approve').route(fastify);

  require('./user/delete')(fastify);

  require('./user/update')(fastify);

  require('./user/verify')(fastify);
    
};