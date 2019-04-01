module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/edit/delete',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: global.public
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          locale: { type: 'string' },
          layer: { type: 'string' },
          table: { type: 'string' },
          filter: { type: 'string' },
        },
        required: ['locale', 'layer', 'table']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.geomTable,
    ],
    handler: async (req, res) => {

      let
        layer = req.params.layer,
        table = req.query.table,
        qID = layer.qID,
        id = req.query.id;

      if (layer.mvt_cache) await require(global.appRoot + '/mod/mvt_cache')(layer, table, id);

      var q = `DELETE FROM ${table} WHERE ${qID} = $1;`;

      var rows = await global.pg.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');

      res.code(200).send('Location delete successful');

    }

  });
};