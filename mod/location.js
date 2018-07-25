module.exports = {
    select,
    chart_data,
    select_ll
};

async function select(req, res, fastify) {

    let
        table = req.body.table,
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        geom = typeof req.body.geom == 'undefined' ? 'geom' : req.body.geom,
        geomj = typeof req.body.geomj == 'undefined' ? `ST_asGeoJson(${geom})` : req.body.geomj,
        geomq = typeof req.body.geomq == 'undefined' ? 'geom' : req.body.geomq,
        geomdisplay = typeof req.body.geomdisplay == 'undefined' ? '' : req.body.geomdisplay,
        sql_filter = typeof req.body.sql_filter == 'undefined' ? '' : req.body.sql_filter,
        user = fastify.jwt.decode(req.cookies.xyz_user);

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, geomj, geomq, geomdisplay, sql_filter]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[user.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }
    
    if(geomdisplay) geomdisplay = `,ST_AsGeoJSON(${req.body.geomdisplay}) as geomdisplay`;

    if (sql_filter) {
        var q = `select ${sql_filter} from ${table} where ${qID} = $1;`;
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

async function select_ll(req, res, fastify) {

    let
        locale = req.query.locale,
        layer = req.query.layer,
        table = req.query.table,
        geom = typeof req.query.geom == 'undefined' ? `geom` : req.query.geom,
        geomj = typeof req.query.geomj == 'undefined' ? `ST_asGeoJson(${geom})` : req.body.geomj,
        geomq = typeof req.query.geomq == 'undefined' ? 'geom' : req.query.geomq,
        lat = parseFloat(req.query.lat),
        lng = parseFloat(req.query.lng),
        user = fastify.jwt.decode(req.cookies.xyz_user);

    //http://localhost:3000/coop/api/location/select_ll?dbs=XYZ&locale=UK&layer=seamless_towns&table=coop.sl&geom=geom_4326&geomq=geom_4326&lat=51.046466499419935&lng=0.36126136779785156

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, geom, geomj, geomq, locale, layer]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[user.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }
    
    let infoj = global.workspace[user.access].config.locales[locale].layers[layer].infoj;
        fields = '';

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
    
    var db_connection = await fastify.pg[req.query.dbs].connect();
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