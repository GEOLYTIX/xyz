module.exports = {
    select,
    chart_data,
    select_ll
};

async function select(req, res, fastify) {

    let
        token = fastify.jwt.decode(req.cookies.xyz_token),
        layer = global.workspace[token.access].config.locales[req.body.locale].layers[req.body.layer],
        table = req.body.table,
        qID = layer.qID ? layer.qID : 'id',
        id = req.body.id,
        geom = layer.geom ? layer.geom : 'geom',
        geomj = layer.geomj ? layer.geomj : `ST_asGeoJson(${geom})`,
        geomq = layer.geomq ? layer.geomq : geom,
        geomdisplay = layer.geomdisplay ? layer.geomdisplay : '',
        sql_filter = req.body.sql_filter ? req.body.sql_filter : ''
        infoj = JSON.parse(JSON.stringify(layer.infoj));

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, geomj, geomq, geomdisplay, sql_filter]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }
    
    if(geomdisplay) geomdisplay = `, ST_AsGeoJSON(${layer.geomdisplay}) AS geomdisplay`;

    if (sql_filter) {
        var q = `select ${sql_filter} from ${table} where ${qID} = $1;`;
        var db_connection = await fastify.pg[layer.dbs].connect();
        var result = await db_connection.query(q, [id]);
        db_connection.release();
        sql_filter = result.rows[0].sql_filter;
    }

    let fields = '';

    infoj.forEach(entry => {
        if (entry.layer) {
            let entry_layer = global.workspace[token.access].config.locales[req.body.locale].layers[entry.layer];
            fields += `
            (SELECT ${entry.field.split('.')[0]}(${entry.field.split('.')[1]})
             FROM ${entry_layer.table}
             WHERE true ${sql_filter || `AND ST_Intersects(${entry_layer.table}.${entry_layer.geom || 'geom'}, ${table}.${geomq})`}
            ) AS "${entry.field}",`;
            return
        }

        if (entry.type) fields += `${entry.fieldfx || entry.field}::${entry.type} AS ${entry.field},`

        if (entry.subfield) fields += `${entry.subfield}::${entry.type} AS ${entry.subfield},`
    });

    var q = `
    SELECT
        ${fields}
        ${geomj} AS geomj
        ${geomdisplay}
    FROM ${table}
    WHERE ${qID} = $1;`;
    
    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q, [id]);
    db_connection.release();

    // Iterate through the infoj object's entries and assign the values returned from the database query.
    Object.values(infoj).forEach(entry => {
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
        infoj: infoj
    });
}

async function select_ll(req, res, fastify) {

    let
        token = req.query.token ?
            fastify.jwt.decode(req.query.token) :
            fastify.jwt.decode(req.cookies.xyz_token),
        locale = req.query.locale,
        layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
        table = req.query.table,
        geom = layer.geom ? layer.geom : 'geom',
        geomj = layer.geomj ? layer.geomj : `ST_asGeoJson(${geom})`,
        geomq = layer.geomq ? layer.geomq : 'geom',
        lat = parseFloat(req.query.lat),
        lng = parseFloat(req.query.lng),
        infoj = JSON.parse(JSON.stringify(layer.infoj));
        
    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, geom, geomj, geomq, locale, layer]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }
    
    let fields = '';

    infoj.forEach(entry => {
        if (entry.layer) {
            fields += `
            (SELECT ${entry.field.split('.')[0]}(${entry.field.split('.')[1]})
             FROM ${entry.layer.table}
             WHERE true ${sql_filter || `AND ST_Intersects(${entry.layer.table}.${entry.layer.geom || 'geom'}, ${table}.${geomq})`}
            ) AS "${entry.field}",`;
            return
        }

        if (entry.type) fields += `${entry.fieldfx || entry.field}::${entry.type} AS ${entry.field},`

        if (entry.subfield) fields += `${entry.subfield}::${entry.type} AS ${entry.subfield},`
    });

    var q = `
    SELECT
        ${fields}
        ${geomj} AS geomj
    FROM ${table}
    WHERE ST_Contains(${geom}, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326));`;
    
    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    // Iterate through the infoj object's entries and assign the values returned from the database query.
    infoj.forEach(entry => {
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
        infoj: infoj
    });
}

async function chart_data(req, res, fastify){
    let table = req.body.table,
        qID = req.body.qID,
        id = req.body.id,
        series = req.body.series;
    
    var q = `SELECT ${series} FROM ${table} WHERE ${qID} = $1;`;  
    var db_connection = await fastify.pg[req.body.dbs].connect();
    var result = await db_connection.query(q, [id]);
    db_connection.release();
    res.code(200).send(result.rows[0]);
}