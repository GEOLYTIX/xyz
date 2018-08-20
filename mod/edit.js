module.exports = { newRecord, newAggregate, updateRecord, deleteRecord };

async function newRecord(req, res, fastify) {

    const token = req.query.token ?
        fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
        layer = global.workspace[token.access].config.locales[req.body.locale].layers[req.body.layer],
        table = req.body.table,
        geom = layer.geom ? layer.geom : 'geom',
        geometry = JSON.stringify(req.body.geometry),
        qID = layer.qID ? layer.qID : 'id',
        log_table = layer.log_table ? layer.log_table : null;

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, geom, log_table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    var q = `
    INSERT INTO ${table} (${geom})
        SELECT ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326) AS ${geom}
        RETURNING ${qID} AS id;`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

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
        filter = JSON.parse(req.query.filter),
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
        '${filter_sql.replace(new RegExp("'", "g"), "''")}' as sql_filter
        FROM ${table_source}
        WHERE true ${filter_sql} ${access_filter ? 'and ' + access_filter : ''}
    
    RETURNING id, ST_X(ST_Centroid(geom)) as lng, ST_Y(ST_Centroid(geom)) as lat;`;

    //console.log(q);

    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    res.code(200).send({
        id: result.rows[0].id.toString(),
        lat: parseFloat(result.rows[0].lat),
        lng: parseFloat(result.rows[0].lng)
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
            geometry = JSON.stringify(req.body.geometry),
            log_table = layer.log_table ? layer.log_table : null;

        // Check whether string params are found in the settings to prevent SQL injections.
        if ([table, geom, qID, log_table]
            .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
            return res.code(406).send('Parameter not acceptable.');
        }
        
        function processInfoj(entry){
            if (entry.images) return
            if (entry.field && entry.type === 'text' && entry.value) fields += `${entry.field} = '${entry.value.replace(/\'/g, "''")}',`;
            if (entry.type === 'integer' && entry.value) fields += `${entry.field} = ${entry.value},`
            if (entry.type === 'integer' && !entry.value) fields += `${entry.field} = null,`
            if (entry.subfield && entry.subvalue) fields += `${entry.subfield} = '${entry.subvalue}',`
            if (entry.type === 'date' && entry.value) fields += `${entry.field} = '${entry.value}',`
            if (entry.type === 'date' && !entry.value) fields += `${entry.field} = null,`
        }

        let fields = '';
        Object.values(req.body.infoj).forEach(entry => {
            if(entry.type === "group"){
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

        var q = `
            UPDATE ${table} SET
                ${fields}
                ${geom} = ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326)
            WHERE ${qID} = $1;`;

        var db_connection = await fastify.pg[layer.dbs].connect();
        await db_connection.query(q, [id]);
        db_connection.release();

        // Write into logtable if logging is enabled.
        if (log_table) await writeLog(req, log_table, table, qID, id, fastify);

        res.code(200).send();

    } catch (err) {
        console.error(err);
        res.code(500).send("soz. it's not you. it's me.");
    }
}

async function deleteRecord(req, res, fastify) {

    const token = req.query.token ?
        fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
        layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
        table = req.query.table,
        qID = layer.qID ? layer.qID : 'id',
        id = req.query.id,
        log_table = layer.log_table ? layer.log_table : null;

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, log_table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    // Write into logtable if logging is enabled.
    if (log_table) await writeLog(req, log_table, table, qID, id, fastify);

    var q = `DELETE FROM ${table} WHERE ${qID} = $1;`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();

    res.code(200).send();
}

async function writeLog(req, log_table, table, qID, id, fastify) {

    var q = `
    INSERT INTO ${log_table} 
    SELECT *
    FROM ${table} WHERE ${qID} = $1;`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    await db_connection.query(q, [id]);
    db_connection.release();
}