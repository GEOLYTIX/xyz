const env = require(global.__approot + '/mod/env');

const fetch = require(global.__approot + '/mod/fetch');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/gazetteer/googleplaces',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: async (req, res) => {

      const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.query.id}&${env.keys.GOOGLE}`;

      const fetched = await fetch(url);

      if (fetched._err) res.code(500).send(fetched._err);

      res.code(200).send({
        type: 'Point',
        coordinates: [fetched.result.geometry.location.lng, fetched.result.geometry.location.lat]
      });

    }
  });
};