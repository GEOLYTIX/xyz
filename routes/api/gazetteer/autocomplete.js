module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/gazetteer/autocomplete',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      // Set locale from workspace and access token.
      const locale = global.workspace[token.access].config.locales[req.query.locale];
      
      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');
      
      // Return 406 is gazetteer is not found in locale.
      if (!locale.gazetteer) return res.code(406).send('Gazetteer not defined for locale.');

      // Set search term from query parameter.
      // Return 406 if search term is missing.
      const term = req.query.q;
      if (!term) return res.code(406).send('No serch term.');

      // Create an empty results object to be populated with the results from the different gazetteer methods.
      let results = [];

      // Locale gazetteer which can query datasources in the same locale.
      if (locale.gazetteer.datasets) {
        results = await require(global.appRoot + '/mod/gazetteer/locale')(term, locale);

        // Return error message _err if an error occured.
        if (results._err) return res.code(500).send(results._err);

        // Return and send results to client.
        if (results.length > 0) return res.code(200).send(results);
      }

      // Query Google Maps API
      if (locale.gazetteer.provider === 'GOOGLE') {
        results = await require(global.appRoot + '/mod/gazetteer/google')(term, locale.gazetteer);

        // Return error message _err if an error occured.
        if (results._err) return res.code(500).send(results._err);
      }

      // Query Mapbox Geocoder API
      if (locale.gazetteer.provider === 'MAPBOX') {
        results = await require(global.appRoot + '/mod/gazetteer/mapbox')(term, locale.gazetteer);

        // Return error message _err if an error occured.
        if (results._err) return res.code(500).send(results._err);
      }

      // Return results to client.
      res.code(200).send(results);

    }
  });
};