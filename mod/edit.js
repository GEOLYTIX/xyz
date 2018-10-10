module.exports = { newRecord, newAggregate, updateRecord, deleteRecord, setIndices };

async function newRecord(req, res, fastify) {

  const token = req.query.token ?
    fastify.jwt.decode(req.query.token) : { access: 'public' };

  let
    layer = global.workspace[token.access].config.locales[req.body.locale].layers[req.body.layer],
    table = req.body.table,
    geom = layer.geom ? layer.geom : 'geom',
    geometry = JSON.stringify(req.body.geometry),
    qID = layer.qID ? layer.qID : 'id';

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table, qID, geom]
    .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }

  const d = new Date();

  var q = `
    INSERT INTO ${table} (${geom} ${layer.log ? `, ${layer.log.field || 'log'}` : ''})
        SELECT ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326)
        ${layer.log && layer.log.table ? `,'{ "user": "${token.email}", "op": "new", "time": "${d.toUTCString()}"}'`: ''}
        RETURNING ${qID} AS id;`;

  var db_connection = await fastify.pg[layer.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  if (layer.log && layer.log.table) await writeLog(fastify, layer, result.rows[0].id);

  res.code(200).send(result.rows[0].id.toString());
}

async function newAggregate(req, res, fastify) {

  const token = req.query.token ?
    fastify.jwt.decode(req.query.token) : { access: 'public' };

  let
    layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
    target_layer = global.workspace[token.access].config.locales[req.query.locale].layers[layer.aggregate_layer],
    table_source = layer.table,
    table_target = target_layer.table,
    geom_source = layer.geom ? layer.geom : 'geom',
    geom_target = target_layer.geomq ? target_layer.geomq : 'geom',
    filter = JSON.parse(req.query.filter) || {},
    filter_sql = '';

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table_target, table_source, geom_target, geom_source]
    .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }

  let access_filter = layer.access_filter && token.email && layer.access_filter[token.email.toLowerCase()] ?
    layer.access_filter[token.email] : null;

  filter_sql = await require('./filters').sql_filter(filter, filter_sql);

  var q = `
    INSERT INTO ${table_target} (${geom_target}, sql_filter)
        SELECT
        ST_Transform(
            ST_SetSRID(
            ST_Buffer(
                ST_Transform(
                ST_SetSRID(
                    ST_Extent(${geom_source}),
                4326),
                3857),
                ST_Distance(
                ST_Transform(
                    ST_SetSRID(
                    ST_Point(
                        ST_XMin(ST_Envelope(ST_Extent(${geom_source}))),
                        ST_YMin(ST_Envelope(ST_Extent(${geom_source})))),
                    4326),
                3857),
                ST_Transform(
                    ST_SetSRID(
                    ST_Point(
                        ST_XMax(ST_Envelope(ST_Extent(${geom_source}))),
                        ST_Ymin(ST_Envelope(ST_Extent(${geom_source})))),
                    4326),
                3857)
                ) * 0.1),
            3857),
        4326) AS ${geom_target},
        '${filter_sql.replace(new RegExp('\'', 'g'), '\'\'')}' as sql_filter
        FROM ${table_source}
        WHERE true ${filter_sql} ${access_filter ? 'and ' + access_filter : ''}
    
    RETURNING id, ST_X(ST_Centroid(geom)) as lng, ST_Y(ST_Centroid(geom)) as lat, sql_filter;`;

  //console.log(q);

  var db_connection = await fastify.pg[layer.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  res.code(200).send({
    id: result.rows[0].id.toString(),
    lat: parseFloat(result.rows[0].lat),
    lng: parseFloat(result.rows[0].lng),
    filter: filter
  });
}

async function updateRecord(req, res, fastify) {
  try {

    const token = req.query.token ?
      fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
      layer = global.workspace[token.access].config.locales[req.body.locale].layers[req.body.layer],
      table = req.body.table,
      qID = layer.qID ? layer.qID : 'id',
      id = req.body.id,
      geom = layer.geom ? layer.geom : 'geom',
      geometry = JSON.stringify(req.body.geometry);

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, geom, qID]
      .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
      return res.code(406).send('Parameter not acceptable.');
    }

    let fields = '';
    Object.values(req.body.infoj).forEach(entry => {
      if(entry.type === 'group'){
        Object.values(entry.items).forEach(item => {
          processInfoj(item);
        });
      } else {
        processInfoj(entry);
      }
      /*if (entry.images) return
            if (entry.field && entry.type === 'text' && entry.value) fields += `${entry.field} = '${entry.value.replace(/\'/g, "''")}',`;
            if (entry.type === 'integer' && entry.value) fields += `${entry.field} = ${entry.value},`
            if (entry.type === 'integer' && !entry.value) fields += `${entry.field} = null,`
            if (entry.subfield && entry.subvalue) fields += `${entry.subfield} = '${entry.subvalue}',`
            if (entry.type === 'date' && entry.value) fields += `${entry.field} = '${entry.value}',`
            if (entry.type === 'date' && !entry.value) fields += `${entry.field} = null,`*/
    });

    const d = new Date();

    var q = `
            UPDATE ${table} SET
                ${fields}
                ${geom} = ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326)
                ${layer.log && layer.log.table ?
    `, ${layer.log.field || 'log'} = '{ "user": "${token.email}", "op": "update", "time": "${d.toUTCString()}"}'` : ''}
            WHERE ${qID} = $1;`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();

    // Write into logtable if logging is enabled.
    if (layer.log && layer.log.table) await writeLog(fastify, layer, id);

    res.code(200).send();

  } catch (err) {
    console.error(err);
    res.code(500).send('soz. it\'s not you. it\'s me.');
  }
}

function processInfoj(entry){
  if (entry.images) return;
  if (entry.field && entry.type === 'text' && entry.value) fields += `${entry.field} = '${entry.value.replace(/'/g, '\'\'')}',`;
  if (entry.type === 'integer' && entry.value) fields += `${entry.field} = ${entry.value},`;
  if (entry.type === 'integer' && !entry.value) fields += `${entry.field} = null,`;
  if (entry.subfield && entry.subvalue) fields += `${entry.subfield} = '${entry.subvalue}',`;
  if (entry.type === 'date' && entry.value) fields += `${entry.field} = '${entry.value}',`;
  if (entry.type === 'date' && !entry.value) fields += `${entry.field} = null,`;
}

async function deleteRecord(req, res, fastify) {

  const token = req.query.token ?
    fastify.jwt.decode(req.query.token) : { access: 'public' };

  let
    layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
    table = req.query.table,
    qID = layer.qID ? layer.qID : 'id',
    id = req.query.id;

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table, qID]
    .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }
    
  const d = new Date();

  // Set the log stamp and create duplicate in log table prior to delete.
  if (layer.log && layer.log.table) {

    var q = `
        UPDATE ${table}
        SET ${layer.log.field || 'log'} = 
            '{ "user": "${token.email}", "op": "delete", "time": "${d.toUTCString()}"}'
        RETURNING ${qID} AS id;`;
    
    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();
    
    await writeLog(fastify, layer, result.rows[0].id);

  }

  q = `DELETE FROM ${table} WHERE ${qID} = $1;`;

  db_connection = await fastify.pg[layer.dbs].connect();
  await db_connection.query(q, [id]);
  db_connection.release();

  res.code(200).send();
}

async function writeLog(fastify, layer, id) {

  // Create duplicate of item in log table.
  var q = `
    INSERT INTO ${layer.log.table} 
    SELECT *
    FROM ${layer.table} WHERE ${layer.qID || 'id'} = $1;`;

  var db_connection = await fastify.pg[layer.dbs].connect();
  await db_connection.query(q, [id]);

  return db_connection.release();
}

async function setIndices(req, res, fastify){

  const del = '__'; // column alias delimiter

  const token = req.query.token ?
    fastify.jwt.decode(req.query.token) : { access: 'public' };

  let params = req.body,
    idx = params.idx;

  let layer = global.workspace[token.access].config.locales[params.locale].layers[params.layer];

  let fields = [];
  Object.keys(idx).map(key => {
    let row = `MAX(${key}) as ${key}${del}max, MIN(${key}) as ${key}${del}min, AVG(${key}) as ${key}${del}avg`;
    fields.push(row);
  });

  let q = `SELECT ${fields.join(',')} FROM ${params.table}`;
    
  //console.log(q);

  var db_connection = await fastify.pg[layer.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  //console.log(result.rows[0]);

  Object.keys(result.rows[0]).forEach(key => {
    let _k = key.split(del);
        
    if(!_k.length || _k.length < 2) return;
        
    if(_k.length === 2){
      idx[_k[0]][_k[1]] = result.rows[0][key];
    } else {
      let _fn = _k[_k.length-1];
      let _f = _k.slice(0, _k.length-1);
      _f = _f.join(del);

      idx[_f][_fn] = result.rows[0][key];
    }
  });

  //console.log(idx);

  res.code(200).send(idx);

  //console.log(req.body);
  res.code(200).send();
}