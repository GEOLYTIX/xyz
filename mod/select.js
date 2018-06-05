async function select(req, res) {

    let
        table = req.body.table,
        geom = typeof req.body.geom == 'undefined' ? 'geom' : req.body.geom,
        geomj = typeof req.body.geomj == 'undefined' ? 'ST_asGeoJson(geom)' : req.body.geomj,
        geomq = typeof req.body.geomq == 'undefined' ? 'geom' : req.body.geomq,
        geomdisplay = typeof req.body.geomdisplay == 'undefined' ? '' : req.body.geomdisplay,
        qID = typeof req.body.qID == 'undefined' ? 'id' : req.body.qID,
        id = req.body.id,
        sql_filter = typeof req.body.sql_filter == 'undefined ' ? null : req.body.sql_filter;
    

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID, req.body.geomj, req.body.geomdisplay], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;
    
    let _q = `select ${sql_filter} from ${table} where ${qID} = $1;`;
    
    let result = await global.DBS[req.body.dbs].query(_q, [id]);
    
    sql_filter = result.rows[0].sql_filter || null;

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

    let q = `
    SELECT
        ${fields}
        ${geomj} AS geomj
        ${geomdisplay}
    FROM ${table}
    WHERE ${qID} = $1;`

    //console.log(q);

    global.DBS[req.body.dbs].query(q, [id])
        .then(result => {

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
            res.status(200).json({
                geomj: result.rows[0].geomj,
                geomdisplay: result.rows[0].geomdisplay || false,
                infoj: req.body.infoj
            });

        })
        .catch(err => console.error(err));
}

async function chart_data(req, res){
    let table = req.body.table,
        qID = req.body.qID,
        id = req.body.id,
        series = req.body.series;
    
    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID, req.body.geomj, req.body.geomdisplay], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;
    
    let q = `SELECT ${series} FROM ${table} WHERE ${qID} = ${id};`;
    
    //console.log(q);
    
     global.DBS[req.body.dbs].query(q)
        .then(result => res.status(200).send(result.rows[0]))
        .catch(err => console.error(err));
}

module.exports = {
    select: select,
    chart_data: chart_data 
};