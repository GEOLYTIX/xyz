const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);

function vector(req, res) {
    let q = "select qid, geomj from "
            + req.query.table + " where ST_DWithin(ST_MakeEnvelope("
            + [req.query.west, req.query.north, req.query.east, req.query.south].join() +", 4326), geom, 0.000001)";
    // console.log(q);

    db.any(q).then(function(data){
        res.status(200).json(data);
    });
}

function vector_info(req, res) {

    let q = "select geomj, infoj from "
        + req.query.qid.split('.')[0] + " where qid = '"
        + req.query.qid + "'";
    // console.log(q);

    db.any(q).then(function (data) {
        res.status(200).json(data);
    });
}

function vector_border(req, res){
    let q = "select geomj from eurostat_nuts__13 where nuts_lv = 0 and nuts_id = '"
        + req.query.country + "'";
    // console.log(q);

    db.any(q).then(function(data){
        res.status(200).json(data);
    });
}

module.exports = {
    vector: vector,
    vector_info: vector_info,
    vector_border: vector_border
};