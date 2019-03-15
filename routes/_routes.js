module.exports = fastify => {

  const authToken = require(global.appRoot +'/mod/authToken')(fastify);

  require('./root').route(fastify, authToken);

  require('./proxy_request')(fastify, authToken);

  require('./api/_api')(fastify, authToken);

  require('./auth/_auth')(fastify, authToken);

  require('./workspace/_workspace')(fastify, authToken);

  require('./map_leaflet').route(fastify);

  require('./report').route(fastify, authToken);

};