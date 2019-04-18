const env = require('../../../mod/env');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/list',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          locale: { type: 'string' },
          layer: { type: 'string' },
          tableDef: { type: 'string' },
          id: { type: 'string' },
          filter: { type: 'string' },
        },
        required: ['locale', 'layer', 'tableDef', 'id']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.locale,
      fastify.evalParam.layer,
      fastify.evalParam.roles,
      fastify.evalParam.tableDef,
    ],
    handler: async (req, res) => {

      let layer = req.params.layer;

      // Get table definition from layer infoj.
      const tableDef = layer.infoj.find(
        entry => entry.title === decodeURIComponent(req.query.tableDef)
      );

      let orderBy = [], conditions = [];

      let fields = tableDef.columns.map(col => {
        // get spatial expression if defined
        if(col.fx) col.fieldfx = `${col.fx}(a.${layer.geom}${col.geography ? '::geography' : ''}, b.${tableDef.geom}${col.geography ? '::geography' : ''})`;
        // get order by clause if defined
        if(col.orderby) orderBy.push(`(${col.fx ? '' : 'b.'}${col.fieldfx || col.field})::${col.type || 'text'}`);
        // get where clause if defined
        if(col.condition && col.condition.phrase) conditions.push(`(${col.fx ? '' : 'b.'}${col.fieldfx || col.field})::${col.type || 'text'} ${col.condition.operator || 'like'} '${col.condition.phrase}'`);
        return `(${col.fx ? '' : 'b.'}${col.fieldfx || col.field})::${col.type || 'text'} AS ${col.field}`;
      });

      let q = `SELECT ${fields.join(',')} 
                FROM ${layer.table} a, ${tableDef.table} b 
                WHERE a.${layer.qID} = $1 
                ${conditions.length ? `AND ${conditions.join(',')}` : ''}
                ORDER BY ${orderBy.join(',')} ${tableDef.order || 'ASC'} LIMIT ${tableDef.limit || 100};`;

      const rows = await env.dbs[layer.dbs](q, [req.query.id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);

    }
  });
};