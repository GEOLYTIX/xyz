const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

function grid(req, res) {
    let q = `SELECT
               lon,
               lat,
               ${req.query.size} size,
               ${req.query.color} color
             FROM ${req.query.table}
             WHERE ST_DWithin(
                     ST_MakeEnvelope(
                       ${req.query.west},
                       ${req.query.south},
                       ${req.query.east},
                       ${req.query.north},
                       4326),
                     geomcntr, 0)
               AND ${req.query.size} >= 1 LIMIT 10000;`

    //console.log(q);

    DBS[req.query.dbs].query(q)
        .then(result => {
            if (result.rows.length === 0) {
                res.status(204).json({});
            } else {
                res.status(200).json(Object.keys(result.rows).map(function (record) {
                    return Object.keys(result.rows[record]).map(function (field) {
                        return result.rows[record][field];
                    });
                }));
            }
        })
        .catch(err => console.log(err));
}

function info(req, res) {
    let q =
        `SELECT
               ${req.body.infoj} AS infoj
             FROM ${req.body.table}
             WHERE
               ST_DWithin(
                 ST_SetSRID(
                   ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'),
                   4326),
                 geomcntr, 0);`

    //console.log(q);

    DBS[req.body.dbs].query(q)
        .then(result => {
            if (result.rows.length === 0) {
                res.status(204).json({});
            } else {
                res.status(200).json(result.rows[0].infoj);
            }
        })
        .catch(err => console.log(err));
}

module.exports = {
    grid: grid,
    info: info
}