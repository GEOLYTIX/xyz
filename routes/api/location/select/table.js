module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/table',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {

      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if layer is not found in locale.
      if (!layer) return res.code(406).send('Invalid layer.');

      var id = req.query.id;

      let withTable = [];
          
      let col_alias = [];
      let col_labels = [];
          
      let row_alias = [];
      let rows = [];

      let lines = [];

      let q;


      let tableDef = layer.infoj[parseInt(req.query.tableDef)];

      if (!tableDef) return res.code(406).send('Missing table definition.');

      // Check whether string params are found in the settings to prevent SQL injections.
      /*if ([table]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }*/


      tableDef.rows.map(row => {
        rows.push(`${row.fieldfx || row.field}::$1 AS ${row.field}`);
        row_alias.push(row.field);
      });

      tableDef.columns.map(col => {

        if(col.lookup){

          col_alias.push(col.field);
          col_labels.push(col.label || col.field);

          rows = rows.map(row => row.replace('$1', col.type || 'text'));

          withTable.push(`${col.field} AS (SELECT ${rows.join(',')}
          FROM ${col.lookup.table_a} a, ${col.lookup.table_b} b
          WHERE a.${layer.qID || 'id'} = ${id}
          AND ${col.lookup.condition ? col.lookup.condition : 'ST_INTERSECTS'}(a.${col.lookup.geom_a}, b.${col.lookup.geom_b})
          )`);
        }

        // include helper column to calculate from
        if(col.exp){ withTable.push(`${col.field} AS (SELECT ${col.exp})`); }
      });

      lines[0] = `UNNEST(ARRAY['${row_alias.join('\',\'')}']) AS rows`;

      for(let col of col_alias){

        let arr = [], str;

        for(let row of row_alias){
          arr.push(`${col}.${row}`);
        }

        str = `UNNEST(ARRAY[${arr.join(',')}]) AS ${col}`;

        lines.push(str);

      }


      if(tableDef.agg){

        for(let key of Object.keys(tableDef.agg)){
          let fields = tableDef.agg[key].rows.map(row => `(${row})::${tableDef.agg[key].type || 'text'}`);
          //str = `UNNEST(ARRAY[${tableDef.agg[key].rows.join(',')}]) AS ${key}`;
          str = `UNNEST(ARRAY[${fields.join(',')}]) AS ${key}`;
          lines.push(str);
        }
      }

      // include helper column
      tableDef.columns.map(col => {if(col.exp) col_alias.push(col.field);});

      q = `WITH ${withTable.join(',')} SELECT ${lines.join(',')} FROM ${col_alias.join(',')};`;

      //let fields = await require(global.appRoot + '/mod/pg/sql_fields')([], layer.infoj, layer.qID);
      
      //console.log(q);
      //console.log('================================');

      var _rows = await global.pg.dbs[layer.dbs](q);

      if (_rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(_rows);
      //res.code(200).send();
    }
  });
};