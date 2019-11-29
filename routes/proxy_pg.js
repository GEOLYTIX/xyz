const env = require('../mod/env');

module.exports = fastify => {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/proxy/pg',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: async (req, res) => {

      var rows = await env.dbs[req.query.dbs](req.body);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Send the infoj object with values back to the client.
      res.code(200).send(rows[0]);

    }
  });
};