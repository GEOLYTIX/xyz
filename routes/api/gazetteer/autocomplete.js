const gaz_locale = require('../../../mod/gazetteer/locale');

const gaz_google = require('../../../mod/gazetteer/google');

const gaz_mapbox = require('../../../mod/gazetteer/mapbox');

const gaz_opencage = require('../../../mod/gazetteer/opencage');

module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/gazetteer/autocomplete',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          locale: { type: 'string' },
          q: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['locale', 'q']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
    ],
    handler: async (req, res) => {

      const locale = req.params.locale;

      // Return 406 is gazetteer is not found in locale.
      if (!locale.gazetteer) return res.code(400).send(new Error('Gazetteer not defined for locale.'));

      // Create an empty results object to be populated with the results from the different gazetteer methods.
      let results = [];

      if (req.query.source) {

        if (req.query.source === 'GOOGLE') {

          results = await gaz_google(req.query.q, locale.gazetteer);

          // Return error message _err if an error occured.
          if (results._err) return res.code(500).send(results._err);

          // Return results to client.
          return res.code(200).send(results);
        }

      }

      // Locale gazetteer which can query datasources in the same locale.
      if (locale.gazetteer.datasets) {
        results = await gaz_locale(req, locale);

        // Return error message _err if an error occured.
        if (results._err) return res.code(500).send(results._err);

        // Return and send results to client.
        if (results.length > 0) return res.code(200).send(results);
      }

      // Query Google Maps API
      if (locale.gazetteer.provider === 'GOOGLE') {
        results = await gaz_google(req.query.q, locale.gazetteer);

        // Return error message _err if an error occured.
        if (results._err) return res.code(500).send(results._err);
      }

      if(locale.gazetteer.provider === 'OPENCAGE'){
        results = await gaz_opencage(req.query.q, locale.gazetteer);
      }

      // Query Mapbox Geocoder API
      if (locale.gazetteer.provider === 'MAPBOX') {
        results = await gaz_mapbox(req.query.q, locale.gazetteer);

        // Return error message _err if an error occured.
        if (results._err) return res.code(500).send(results._err);
      }

      // Return results to client.
      res.code(200).send(results);

    }
  });
};