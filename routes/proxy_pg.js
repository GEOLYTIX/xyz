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
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
    ],
    handler: async (req, res) => {

      const q = req.params.locale.queries[req.query.q];

      var rows = await env.dbs[req.query.dbs](q,[req.body],null,req.query.no_timeout);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // Send the infoj object with values back to the client.
      res.code(200).send(rows[0]);

    }
  });
};