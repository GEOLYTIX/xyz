module.exports = {
    select,
    chart_data,
    select_ll,
    select_ll_nnearest,
    select_ll_intersect
};

async function select(req, res, fastify) {

    const token = req.query.token ?
        fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
        layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
        table = req.query.table,
        qID = layer.qID ? layer.qID : 'id',
        id = req.query.id,
        geom = layer.geom ? layer.geom : 'geom',
        geomj = layer.geomj ? layer.geomj : `ST_asGeoJson(${geom})`,
        //geomj = layer.geomj ? `ST_asGeoJson(${layer.geomj})` : `ST_asGeoJson(${geom})`,
        geomq = layer.geomq ? layer.geomq : geom,
        geomdisplay = layer.geomdisplay ? layer.geomdisplay : '',
        //filter = req.query.filter ? JSON.parse(req.query.filter) : {},
        sql_filter = layer.sql_filter ? layer.sql_filter : '',
        infoj = JSON.parse(JSON.stringify(layer.infoj));

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, qID, geomj, geomq, geomdisplay]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    if (geomdisplay) geomdisplay = `, ST_AsGeoJSON(${layer.geomdisplay}) AS geomdisplay`;

    if (sql_filter) {
        var q = `select ${sql_filter} from ${table} where ${qID} = $1;`;
        var db_connection = await fastify.pg[layer.dbs].connect();
        var result = await db_connection.query(q, [id]);
        db_connection.release();
        sql_filter = result.rows[0].sql_filter;
    }

    let access_filter = layer.access_filter && token.email && layer.access_filter[token.email.toLowerCase()] ?
        layer.access_filter[token.email] : null;

    //sql_filter = filter ? require('./filters').sql_filter(filter) : '';

    let fields = '';
    
    function processInfoj(entry){
        
        if (entry.layer) {
            let entry_layer = global.workspace[token.access].config.locales[req.query.locale].layers[entry.layer];

            // For grids we want to use the highest resolution grid for the lookup.
            let tableArray = entry_layer.arrayZoom ? Array.from(Object.values(entry_layer.arrayZoom)) : null;

            // Get the last tableArray table name.
            let entry_table = tableArray ? tableArray[tableArray.length - 1] : null;

            fields += `
            (SELECT ${entry.field.split('.')[0]}(${entry.field.split('.')[1]})
            FROM ${entry_table || entry_layer.table}
            WHERE true ${sql_filter || `AND ST_Intersects(${entry_table || entry_layer.table}.${entry_layer.geom || 'geom'}, ${table}.${geomq})`}
            ${access_filter ? 'AND ' + access_filter : ''}
            ) AS "${entry.field}", `;
            return
        }
        
        if (entry.type && entry.type !== 'group') fields += `${entry.fieldfx || entry.field}::${entry.type} AS ${entry.field}, `;
        
        if (entry.subfield) fields += `${entry.subfield}::${entry.type} AS ${entry.subfield}, `
    }

    infoj.forEach(entry => {
        if(entry.type == "group"){
            Object.values(entry.items).forEach(item => {
                processInfoj(item);
            });
        } else {
            processInfoj(entry);
        }
    });

    let qLog = layer.log_table ?
    `( SELECT
        *,
        ROW_NUMBER()
        OVER (
          PARTITION BY ${layer.qID || 'id'}
          ORDER BY ((${layer.log_table.field || 'log'} -> 'time') :: VARCHAR) :: TIMESTAMP DESC ) AS rank
      FROM gb_retailpoint_editable_logs
    ) AS logfilter` : null;

    var q = `
    SELECT
        ${fields}
        ${geomj} AS geomj
        ${geomdisplay}
    FROM ${layer.log_table ? qLog : table}
    WHERE 
    ${layer.log_table ? 'rank = 1 AND ' : ''}
    ${qID} = $1;`;

    try {
        var db_connection = await fastify.pg[layer.dbs].connect();
        var result = await db_connection.query(q, [id]);
        db_connection.release();
    } catch(err) {
        err.detail = {
            token: token,
            locale: req.query.locale,
            layer: req.query.layer,
            q: q.replace(/\n/g,'').replace(/\s\s+/g, ' ').replace(/\$1/, id)
        };

        fastify.log.error(err);

        return res.code(401).send();
    }

    if (result.rowCount === 0) {
        return res.code(401).send();
    }

    // Iterate through the infoj object's entries and assign the values returned from the database query.
    Object.values(infoj).map(entry => {
    
        if(entry.type == 'group'){
            Object.values(entry.items).map(item => {
                setValues(result, item);
            });
            return;
        }
        setValues(result, entry);
    });

    function formatDate(str){
        let d = new Date(str),
            options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
            loc = "en-GB";
        return d ? d.toLocaleDateString('en-GB', options) : false;
    }

    function formatDateTime(str){
        let d = new Date(str),
            options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
            loc = "en-GB";
        return d ? d.toLocaleDateString('en-GB', options) + ', ' + d.toLocaleTimeString('en-GB') : false;
    }
    
    function setValues(result, entry){
        
        if (result.rows[0][entry.field] || result.rows[0][entry.field] == 0) {
            if(entry.datetime){
                entry.value = formatDateTime(result.rows[0][entry.field]); 
                return;
            }
            if(entry.date){
                entry.value = formatDate(result.rows[0][entry.field]);
                return;
            }
            entry.value = result.rows[0][entry.field];
        }
        if (result.rows[0][entry.subfield]) {
            entry.subvalue = result.rows[0][entry.subfield];
        }
    }
    
    // Send the infoj object with values back to the client.
    res.code(200).send({
        geomj: result.rows[0].geomj,
        geomdisplay: result.rows[0].geomdisplay || false,
        infoj: infoj
    });
}

async function select_ll(req, res, fastify) {

    const token = req.query.token ?
        fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
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

async function select_ll_nnearest(req, res, fastify) {

    const token = req.query.token ?
        fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
        locale = req.query.locale,
        layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
        table = req.query.table,
        geom = layer.geom ? layer.geom : 'geom',
        geomj = layer.geomj ? layer.geomj : `ST_asGeoJson(${geom})`,
        geomq = layer.geomq ? layer.geomq : 'geom',
        lat = parseFloat(req.query.lat),
        lng = parseFloat(req.query.lng),
        nnearest = parseInt(req.query.nn || 3),
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
    ORDER BY ST_SetSRID(ST_Point(${lng}, ${lat}), 4326) <#> ${geom}
    LIMIT ${nnearest};`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    // Iterate through the infoj object's entries and assign the values returned from the database query.
    result.rows.forEach(row => {
        infoj.forEach(entry => {
            if (row[entry.field] || row[entry.field] == 0) {
                entry.value = row[entry.field];
            }
            if (row[entry.subfield]) {
                entry.subvalue = row[entry.subfield];
            }
        });
    })

    // Send the infoj object with values back to the client.
    res.code(200).send(result.rows);
}

async function select_ll_intersect(req, res, fastify) {

    const token = req.query.token ?
        fastify.jwt.decode(req.query.token) : { access: 'public' };

    let
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
    WITH T AS (
        SELECT
        ${geom} AS _geom
        FROM ${table}
        WHERE ST_Contains(${geom}, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
        LIMIT 1
    )
    SELECT
        ${fields}
        ${geomj} AS geomj
    FROM ${table}, T
    WHERE ST_Intersects(${geom}, _geom);`;

    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    // Iterate through the infoj object's entries and assign the values returned from the database query.
    result.rows.forEach(row => {
        infoj.forEach(entry => {
            if (row[entry.field] || row[entry.field] == 0) {
                entry.value = row[entry.field];
            }
            if (row[entry.subfield]) {
                entry.subvalue = row[entry.subfield];
            }
        });
    })

    // Send the infoj object with values back to the client.
    res.code(200).send(result.rows);
}

async function chart_data(req, res, fastify) {
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