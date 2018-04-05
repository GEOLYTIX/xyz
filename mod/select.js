async function select(req, res) {

    let
        table = req.body.table,
        geomj = typeof req.body.geomj == 'undefined' ? 'ST_asGeoJson(geom)' : req.body.geomj,
        geomdisplay = typeof req.body.geomdisplay == 'undefined' ? '' : req.body.geomdisplay,
        qID = req.body.qID,
        id = req.body.id;

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, qID, req.body.geomj, req.body.geomdisplay], res).statusCode === 406) return;

    if (await require('./chk').chkID(id, res).statusCode === 406) return;

    let fields = '';
    Object.keys(req.body.infoj).map(key => {
        if (req.body.infoj[key].type) fields += `${req.body.infoj[key].fieldfx || req.body.infoj[key].field}::${req.body.infoj[key].type} AS ${req.body.infoj[key].field},`
        if (req.body.infoj[key].subfield) fields += `${req.body.infoj[key].subfield}::${req.body.infoj[key].type} AS ${req.body.infoj[key].subfield},`
    });

    let q = `
    SELECT
        ${fields}
        ${geomj} AS geomj
        ${geomdisplay}
    FROM ${table}
    WHERE ${qID} = '${id}';`

    // console.log(q);

    global.DBS[req.body.dbs].query(q)
        .then(result => {

            Object.keys(req.body.infoj).map(key => {
                if (result.rows[0][req.body.infoj[key].field] || result.rows[0][req.body.infoj[key].field] == 0) {
                    req.body.infoj[key].value = result.rows[0][req.body.infoj[key].field];
                }
                if (result.rows[0][req.body.infoj[key].subfield]) {
                    req.body.infoj[key].subvalue = result.rows[0][req.body.infoj[key].subfield];
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