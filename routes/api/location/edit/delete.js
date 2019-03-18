module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/edit/delete',
    preHandler: fastify.auth([
      (req, res, done) => fastify.authToken(req, res, done, { lv: global.access, API: true })
    ]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const layer = global.workspace['admin'].config.locales[req.query.locale].layers[req.query.layer];

      if (!layer) return res.code(500).send('Layer not found.');

      let
        table = req.query.table,
        qID = layer.qID,
        id = req.query.id;

      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table, qID]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace['admin'].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }

      // const d = new Date();

      // // Set the log stamp and create duplicate in log table prior to delete.
      // if (layer.log && layer.log.table) {

      //   var q = `
      //   UPDATE ${table}
      //   SET ${layer.log.field || 'log'} = 
      //     '{ "user": "${token.email}", "op": "delete", "time": "${d.toUTCString()}"}'
      //   RETURNING ${qID} AS id;`;

      //   var rows = await global.pg.dbs[layer.dbs](q);

      //   if (rows.err) return res.code(500).send('soz. it\'s not you. it\'s me.');

      //   await writeLog(layer, rows[0].id);

      // }

      if (layer.mvt_cache) await require(global.appRoot + '/mod/mvt_cache')(layer, table, id);

      var q = `DELETE FROM ${table} WHERE ${qID} = $1;`;

      var rows = await global.pg.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('PostgreSQL query error - please check backend logs.');

      res.code(200).send('Location delete successful');

    }
  });
};