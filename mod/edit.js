module.exports = { newRecord, newAggregate, updateRecord, deleteRecord };

async function newRecord(req, res, fastify) {

    let table = req.body.table,
        geom = typeof req.body.geom == 'undefined' ? 'geom' : req.body.geom,
        geometry = JSON.stringify(req.body.geometry),
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        log_table = typeof req.body.log_table == 'undefined' ? null : req.body.log_table;

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, geom, log_table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.appSettingsValues.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    var q = `
    INSERT INTO ${table} (${geom})
        SELECT ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326) AS ${geom}
        RETURNING ${qID} AS id;`;

    var db_connection = await fastify.pg[req.body.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    res.code(200).send(result.rows[0].id.toString());
}

async function newAggregate(req, res, fastify) {
    let table_target = req.query.table_target,
        table_source = req.query.table_source,
        geom_target = req.query.geom_target === 'undefined' ? 'geom' : req.query.geom_target,
        geom_source = req.query.geom_source === 'undefined' ? 'geom' : req.query.geom_source,
        filter = JSON.parse(req.query.filter),
        filter_sql = '';

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
        '${filter_sql.replace(new RegExp("'", "g"), "''")}' as sql_filter
        FROM ${table_source}
        WHERE true ${filter_sql}
    
    RETURNING id, ST_X(ST_Centroid(geom)) as lng, ST_Y(ST_Centroid(geom)) as lat;`;

    var db_connection = await fastify.pg[req.query.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    res.code(200).send({
        id: result.rows[0].id.toString(),
        lat: parseFloat(result.rows[0].lat),
        lng: parseFloat(result.rows[0].lng)
    });
}

async function updateRecord(req, res, fastify) {

    let table = req.body.table,
        geom = typeof req.body.geom == 'undefined' ? 'geom' : req.body.geom,
        geometry = JSON.stringify(req.body.geometry),
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        log_table = typeof req.body.log_table == 'undefined' ? null : req.body.log_table;

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, geom, qID, log_table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.appSettingsValues.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    let fields = '';
    Object.values(req.body.infoj).forEach(entry => {
        if (entry.images) return
        if (entry.type === 'text') fields += `${entry.field} = '${entry.value}',`;
        if (entry.type === 'integer' && entry.value) fields += `${entry.field} = ${entry.value},`
        if (entry.type === 'integer' && !entry.value) fields += `${entry.field} = null,`
        if (entry.subfield && entry.subvalue) fields += `${entry.subfield} = '${entry.subvalue}',`
        if (entry.type === 'date' && entry.value) fields += `${entry.field} = '${entry.value}',`
        if (entry.type === 'date' && !entry.value) fields += `${entry.field} = null,`
    });

    var q = `
    UPDATE ${table} SET
        ${fields}
        ${geom} = ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326)
    WHERE ${qID} = $1;`

    var db_connection = await fastify.pg[req.body.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();

    // Write into logtable if logging is enabled.
    if (log_table) await writeLog(req, log_table, table, qID, id, fastify);

    res.code(200).send();
}

async function deleteRecord(req, res, fastify) {

    let table = req.body.table,
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        log_table = typeof req.body.log_table == 'undefined' ? null : req.body.log_table;

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, log_table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.appSettingsValues.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    // Write into logtable if logging is enabled.
    if (log_table) await writeLog(req, log_table, table, qID, id, fastify);

    var q = `DELETE FROM ${table} WHERE ${qID} = $1;`;

    var db_connection = await fastify.pg[req.body.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();

    res.code(200).send();
}

async function writeLog(req, log_table, table, qID, id, fastify) {

    let user_token = fastify.jwt.decode(req.cookies.xyz_user),
        username = user_token.email ? user_token.email : 'anonymous';

    var q = `
    INSERT INTO ${log_table} 
    SELECT *
    FROM ${table} WHERE ${qID} = $1;`;

    var db_connection = await fastify.pg[req.body.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();
}