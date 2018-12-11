module.exports = fastify => {
   
  require('./register')(fastify);

  // token
  
  require('./token/api')(fastify);

  // user

  require('./user/admin')(fastify);

  require('./user/approve')(fastify);

  require('./user/delete')(fastify);

  require('./user/update')(fastify);

  require('./user/verify')(fastify);
    
};