const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

function chkVals(vals, res) {
    vals.forEach((val) => {
        if (typeof val === 'string' && global.appSettingsValues.indexOf(val) < 0) {
            console.log('Possible SQL injection detected');
            res.redirect(301, 'https://giphy.com/gifs/newman-dennis-nedry-jurrasic-park-FmyCxAjnOP5Di/fullscreen');
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
        ${req.body.geomj} AS geomj
        ${req.body.geomdisplay}
     FROM ${req.body.table}
     WHERE
        ${req.body.qID} = '${req.body.id}';`

    //console.log(q);

    DBS[req.body.dbs].query(q)
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