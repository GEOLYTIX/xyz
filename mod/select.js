async function select(req, res) {

    let
        table = req.body.table,
        geom = typeof req.body.geom == 'undefined' ? 'geom' : req.body.geom,
        geomj = typeof req.body.geomj == 'undefined' ? 'ST_asGeoJson(geom)' : req.body.geomj,
        geomdisplay = typeof req.body.geomdisplay == 'undefined' ? '' : req.body.geomdisplay,
        qID = req.body.qID,
        id = req.body.id;

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID, req.body.geomj, req.body.geomdisplay], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;

    let fields = '',
        sql_filter = '';

    req.body.infoj.forEach(entry => {
        if (entry.layer) {
            fields += `
            (SELECT ${entry.field.split('.')[0]}(${entry.field.split('.')[1]})
             FROM ${entry.layer.table}
             WHERE ST_Intersects(${entry.layer.table}.${entry.layer.geom || 'geom'}, ${table}.${geom})
             ${sql_filter}
            ) AS "${entry.field}",
            `
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

    // console.log(q);

    global.DBS[req.body.dbs].query(q, [id])
        .then(result => {


            // Object.keys(req.body.infoj).map(key => {
            //     if (result.rows[0][req.body.infoj[key].field] || result.rows[0][req.body.infoj[key].field] == 0) {
            //         req.body.infoj[key].value = result.rows[0][req.body.infoj[key].field];
            //     }
            //     if (result.rows[0][req.body.infoj[key].subfield]) {
            //         req.body.infoj[key].subvalue = result.rows[0][req.body.infoj[key].subfield];
            //     }
            // });

            Object.values(req.body.infoj).map(entry => {
                if (result.rows[0][entry.field] || result.rows[0][entry.field] == 0) {
                    entry.value = result.rows[0][entry.field];
                }
                if (result.rows[0][entry.subfield]) {
                    entry.subvalue = result.rows[0][entry.subfield];
                }
            });


            res.status(200).json({
                geomj: result.rows[0].geomj,
                geomdisplay: result.rows[0].geomdisplay || false,
                infoj: req.body.infoj
            });

        })
        .catch(err => console.error(err));
}

module.exports = {
    select: select
};