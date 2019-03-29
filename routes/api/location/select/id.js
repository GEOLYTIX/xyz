module.exports =  fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/select/id',
    preValidation: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, {
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
          id: { type: 'string' },
        },
        required: ['locale', 'layer', 'table', 'id']
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
        id = req.query.id,
        qID = layer.qID;
      
      // Clone the infoj from the memory workspace layer.
      const infoj = JSON.parse(JSON.stringify(layer.infoj));

      // Get a EPSG:4326 geom field which is used to generate geojson for the client map.
      // The geom field is also required for lookup fields.
      const geom = layer.geom ?
        `${table}.${layer.geom}`
        : `(ST_Transform(ST_SetSRID(${table}.${layer.geom_3857}, 3857), 4326))`;



      // The fields array stores all fields to be queried for the location info.
      const fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, qID);

      // Push JSON geometry field into fields array.
      fields.push(`\n   ST_asGeoJson(${geom}) AS geomj`);
        
       
      // let qLog = layer.log_table ?
      //   `( SELECT *, ROW_NUMBER() OVER (
      //       PARTITION BY ${layer.qID || 'id'}
      //       ORDER BY ((${layer.log_table.field || 'log'} -> 'time') :: VARCHAR) :: TIMESTAMP DESC ) AS rank
      //       FROM gb_retailpoint_editable_logs  AS logfilter`
      //   : null;
        
      // q = `
      // SELECT
      //     ${fields}
      //     ${geomj} AS geomj
      // FROM ${layer.log_table ? qLog : table}
      // WHERE 
      // ${layer.log_table ? 'rank = 1 AND ' : ''}
      // ${qID} = $1;`;
      

      const fields_with = [];

      await infoj.forEach(entry => {

        if (entry.withSelect) {
          fields_with.push(`${entry.fieldfx} as ${entry.field}`);
        } else if (entry.field && !entry.columns) {
          fields_with.push(entry.field);
        }

      });

      var q = `
      with q as (
        SELECT ${fields.join()}
        FROM ${table}
        WHERE ${qID} = $1
      )
      select ${fields_with.join()}, geomj from q
      `;

      var rows = await global.pg.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(202).send('No rows returned from table.');

      // Iterate through infoj entries and assign values returned from query.
      infoj.forEach(entry =>  {
        if (rows[0][entry.field]) entry.value = rows[0][entry.field];
      });
    
      // Send the infoj object with values back to the client.
      res.code(200).send({
        geomj: JSON.parse(rows[0].geomj),
        infoj: infoj
      });

    }
  });
};