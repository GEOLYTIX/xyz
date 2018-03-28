function chkVals(vals, res) {
    vals.forEach((val) => {
        if (typeof val === 'string' && global.appSettingsValues.indexOf(val) < 0) {
            console.log('Possible SQL injection detected');
            res.status(406).sendFile(appRoot + '/public/dennis_nedry.gif');
        }
    })
    return res;
}

function select(req, res) {

    //if (await chkVals([], res).statusCode === 301) return;

    let fields = '';
    Object.keys(req.body.infoj).map(key => {
        if (req.body.infoj[key].type) fields += `${req.body.infoj[key].fieldfx || req.body.infoj[key].field}::${req.body.infoj[key].type} AS ${req.body.infoj[key].field},`
        if (req.body.infoj[key].subfield) fields += `${req.body.infoj[key].subfield}::${req.body.infoj[key].type} AS ${req.body.infoj[key].subfield},`
    });

    let q =
    `SELECT
        ${fields}
        ${typeof req.body.geomj == 'undefined' ? 'ST_asGeoJson(geom)' : req.body.geomj} AS geomj
        ${req.body.geomdisplay}
     FROM ${req.body.table}
     WHERE
        ${req.body.qID} = '${req.body.id}';`

    //console.log(q);

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
    .catch(err => console.log(err));
}

module.exports = {
    select: select
};