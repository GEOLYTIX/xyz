async function newRecord(req, res) {

    let q,
        table = req.body.table,
        log_table = req.body.log_table,
        geometry = JSON.stringify(req.body.geometry),
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        cat = req.body.cluster_cat || 'other',
        username = req.session.passport ? req.session.passport.user.email : 'nologin';

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;


        q = `INSERT INTO ${table} (username, geom)
            SELECT '${username}' as username, ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326) AS geom
            RETURNING id;`;

    let result = await global.DBS[req.body.dbs].query(q);

    res.status(200).send(result.rows[0].id.toString());
}

async function newAggregate(req, res) {
    let table_target = req.query.table_target,
        table_source = req.query.table_source,
        geom_target = req.query.geom_target === 'undefined' ? 'geom' : req.query.geom_target,
        geom_source = req.query.geom_source === 'undefined' ? 'geom' : req.query.geom_source,
        filter = JSON.parse(req.query.filter),
        filter_sql = '';

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table_target, table_source, geom_target, geom_source], res).statusCode === 406) return;

    filter_sql = await require('./filters').sql_filter(filter, filter_sql);

    let q = `
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
        4326) AS ${geom_target}, '${filter_sql.replace(new RegExp("'", "g"), "''")}' as sql_filter
        FROM ${table_source}
        WHERE true ${filter_sql}
    
    RETURNING id, ST_X(ST_Centroid(geom)) as lng, ST_Y(ST_Centroid(geom)) as lat;`;

    //console.log(q);

    let result = await global.DBS[req.query.dbs].query(q);

    res.status(200).send({
        id: result.rows[0].id.toString(),
        lat: parseFloat(result.rows[0].lat),
        lng: parseFloat(result.rows[0].lng)
    });
}

async function updateRecord(req, res) {
    let table = req.body.table,
        geometry = JSON.stringify(req.body.geometry),
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        fields = '',
        log_table = typeof req.body.log_table == 'undefined' ? null : req.body.log_table,
        username = req.session.passport ? req.session.passport.user.email : 'nologin';

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;

    Object.values(req.body.infoj).forEach(entry => {
        if (entry.images) return
        if (entry.type === 'text') fields += `${entry.field} = '${entry.value}',`;
        if (entry.type === 'integer' && entry.value) fields += `${entry.field} = ${entry.value},`
        if (entry.type === 'integer' && !entry.value) fields += `${entry.field} = null,`
        if (entry.subfield && entry.subvalue) fields += `${entry.subfield} = '${entry.subvalue}',`
        if (entry.type === 'date' && entry.value) fields += `${entry.field} = '${entry.value}',`
        if (entry.type === 'date' && !entry.value) fields += `${entry.field} = null,`
    });

    let q = `
    UPDATE ${table} SET
        ${fields}
        geom = ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), 4326)
    WHERE ${qID} = $1;`
    
    //console.log(q);

    await global.DBS[req.body.dbs].query(q, [id]);

    // Write into logtable if logging is enabled.
    if (log_table) await writeLog(req, log_table, table, qID, id);

    res.status(200).send();

}

async function deleteRecord(req, res) {

    let table = req.body.table,
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        log_table = typeof req.body.log_table == 'undefined' ? null : req.body.log_table;

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;

    // Write into logtable if logging is enabled.
    if (log_table) await writeLog(req, log_table, table, qID, id);

    let q = `DELETE FROM ${table} WHERE ${qID} = $1;`;

    await global.DBS[req.body.dbs].query(q, [id]);
    
    res.status(200).send();
}

async function writeLog(req, log_table, table, qID, id){
    let username = req.session.passport ? req.session.passport.user.email : 'nologin';

    
    let q = `
    INSERT INTO ${log_table} 
    SELECT *
    FROM ${table} WHERE ${qID} = $1;`;
    //console.log(q);

    return await global.DBS[req.body.dbs].query(q, [id]);
}

module.exports = {
    newRecord: newRecord,
    newAggregate: newAggregate,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
};