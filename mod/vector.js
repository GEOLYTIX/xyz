const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);

function vector(req, res) {
    let q = `SELECT qid, geomj
               FROM ${req.query.table}
               WHERE ST_DWithin(
                       ST_MakeEnvelope(
                         ${req.query.west},
                         ${req.query.south},
                         ${req.query.east},
                         ${req.query.north},
                         4326),
                       geom, 0.000001);`

    //console.log(q);

    db.any(q).then(function(data){
        res.status(200).json(data);
    });
}

function vector_info(req, res) {

    let q = `SELECT
               geomj,
               infoj
               FROM ${req.query.qTable}
               WHERE qid = '${req.query.qID}';`

    //console.log(q);
             
    db.any(q).then(function (data) {
        res.status(200).json(data);
    });
}

module.exports = {
    vector: vector,
    vector_info: vector_info
};