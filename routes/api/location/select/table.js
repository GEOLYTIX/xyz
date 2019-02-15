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

      //const table = req.query.table;

      // Return 406 if table is not defined as request parameter.
      //if (!table) return res.code(406).send('Missing table.');

      // let offset = parseInt(req.body.offset);
              
      // Check whether string params are found in the settings to prevent SQL injections.
      /*if ([table]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }*/

      let q;

      let id = req.query.id;

      Object.values(layer.infoj).map(entry => {
        if(entry.type === 'tableDefinition'){
          // here process tableDef object into a query
          
          let withTable = [];
          let col_alias = [];
          let row_alias = [];
          let rows = [];
          let col_labels = [];
          let lines = [];

          entry.rows.map(row => {
            rows.push(`${row.fieldfx || row.field} AS ${row.field}`);
            row_alias.push(row.field);
          });

          entry.columns.map(col => {
            col_alias.push(col.field);
            col_labels.push(col.label || col.field);

            withTable.push(`${col.field} AS (SELECT ${rows.join(',')}
              FROM ${col.lookup.table_a} a, ${col.lookup.table_b} b
              WHERE a.${layer.qID || 'id'} = ${id}
              AND ${col.lookup.condition ? col.lookup.condition : 'ST_INTERSECTS'}(a.${col.lookup.geom_a}, b.${col.lookup.geom_b})
              )`);
          });

          //console.log(`WITH ${withTable.join(',')}`); // 1st part

          lines[0] = `UNNEST(ARRAY['${row_alias.join('\',\'')}']) AS rows`;

          for(let col of col_alias){

            let arr = [];

            for(let row of row_alias){
              arr.push(`${col}.${row}`);
            }

            let str = `UNNEST(ARRAY[${arr.join(',')}]) AS ${col}`;

            lines.push(str);

          }

          //console.log(lines.join(',')); // 2nd part

          q = `WITH ${withTable.join(',')} SELECT ${lines.join(',')} FROM ${col_alias.join(',')};`;

          console.log('col alias');
          console.log(col_alias); // sql safe column names (fields)

          console.log('row alias');
          console.log(row_alias); // sql safe row names - fields

          console.log('rows'); // sql functions or columns
          console.log(rows);

          console.log('col labels'); // column label for display or field
          console.log(col_labels);
        
        }

      });

      // SQL filter
      // const filter_sql = layer.filter && await require(global.appRoot + '/mod/pg/sql_filter')(layer.filter) || '';

      //let fields = await require(global.appRoot + '/mod/pg/sql_fields')([], layer.infoj, layer.qID);
      
      /*let q = `
        SELECT ${layer.qID} AS qID, ${fields}
        FROM ${table}
        ${viewport || ''}
        FETCH FIRST 99 ROW ONLY;`;*/

      //console.log(q);

      var rows = await global.pg.dbs[layer.dbs](q);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      res.code(200).send(rows);
      //res.code(200).send();
    }
  });
};