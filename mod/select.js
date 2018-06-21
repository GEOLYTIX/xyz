async function select(req, res, fastify) {

    let
        q,
        result,
        table = req.body.table,
        geom = typeof req.body.geom == 'undefined' ? 'geom' : req.body.geom,
        geomj = typeof req.body.geomj == 'undefined' ? 'ST_asGeoJson(geom)' : req.body.geomj,
        geomq = typeof req.body.geomq == 'undefined' ? 'geom' : req.body.geomq,
        geomdisplay = typeof req.body.geomdisplay == 'undefined' ? '' : req.body.geomdisplay,
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        sql_filter = typeof req.body.sql_filter == 'undefined ' ? null : req.body.sql_filter;
    
    // Check whether string params are found in the settings to prevent SQL injections.
    //if (await require('./chk').chkVals([table, qID, req.body.geomj, req.body.geomdisplay], res).statusCode === 406) return;

    //if (await require('./chk').chkID(id, res).statusCode === 406) return;
    
    if (sql_filter) {
        q = `select ${sql_filter} from ${table} where ${qID} = $1;`;
        var db_connection = await fastify.pg[req.body.dbs].connect();
        var result = await db_connection.query(q, [id]);
        db_connection.release();
        sql_filter = result.rows[0].sql_filter;
    }

    let fields = '';

    req.body.infoj.forEach(entry => {
        if (entry.layer) {
            fields += `
            (SELECT ${entry.field.split('.')[0]}(${entry.field.split('.')[1]})
             FROM ${entry.layer.table}
             WHERE true ${sql_filter || `AND ST_Intersects(${entry.layer.table}.${entry.layer.geom || 'geom'}, ${table}.${geomq})`}

            ) AS "${entry.field}",
            `
            //console.log(fields);
            return
        }

        if (entry.type) fields += `
        ${entry.fieldfx || entry.field}::${entry.type} AS ${entry.field},
        `

        if (entry.subfield) fields += `
        ${entry.subfield}::${entry.type} AS ${entry.subfield},
        `
    });

    q = `
    SELECT
        ${fields}
        ${geomj} AS geomj
        ${geomdisplay}
    FROM ${table}
    WHERE ${qID} = $1;`
    //console.log(q);

    var db_connection = await fastify.pg[req.body.dbs].connect();
    var result = await db_connection.query(q, [id]);
    db_connection.release();

    // Iterate through the infoj object's entries and assign the values returned from the database query.
    Object.values(req.body.infoj).forEach(entry => {
        if (result.rows[0][entry.field] || result.rows[0][entry.field] == 0) {
            entry.value = result.rows[0][entry.field];
        }
        if (result.rows[0][entry.subfield]) {
            entry.subvalue = result.rows[0][entry.subfield];
        }
    });

    // Send the infoj object with values back to the client.
    res.code(200).send({
        geomj: result.rows[0].geomj,
        geomdisplay: result.rows[0].geomdisplay || false,
        infoj: req.body.infoj
    });
}

async function chart_data(req, res, fastify){
    let table = req.body.table,
        qID = req.body.qID,
        id = req.body.id,
        series = req.body.series;
    
    // Check whether string params are found in the settings to prevent SQL injections.
    //if (await require('./chk').chkVals([table, qID, req.body.geomj, req.body.geomdisplay], res).statusCode === 406) return;

    //if (await require('./chk').chkID(id, res).statusCode === 406) return;
    
    let q = `SELECT ${series} FROM ${table} WHERE ${qID} = $1;`;
    //console.log(q);
    
    var db_connection = await fastify.pg[req.body.dbs].connect();
    var result = await db_connection.query(q, [id]);
    db_connection.release();
    res.code(200).send(result.rows[0]);
}

module.exports = {
    select: select,
    chart_data: chart_data 
};