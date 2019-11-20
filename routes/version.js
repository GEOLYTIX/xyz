const version = require('../package.json').version;

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/version',
    handler: async (req, res) => {

        res.send(version);

    }
  });
};