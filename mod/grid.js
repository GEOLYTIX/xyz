let pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('.')[0] === 'DBS')
        DBS[key.split('.')[1]] = pgp(process.env[key])
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

    DBS[req.query.dbs].any(q)
        .then(function (data) {
            res.status(200).json(Object.keys(data).map(function (record) {
                return Object.keys(data[record]).map(function (field) {
                    return data[record][field];
                });
            }));
        });
}

function info(req, res) {
    let q = `SELECT
               ${req.body.infoj} AS infoj
             FROM ${req.body.table}
             WHERE
               ST_DWithin(
                 ST_SetSRID(
                   ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'),
                   4326),
                 geomcntr, 0);`

    //console.log(q);

    DBS[req.body.dbs].any(q)
        .then(function (data) {
            res.status(200).json(data[0].infoj);
        });
}

module.exports = {
    grid: grid,
    info: info
}