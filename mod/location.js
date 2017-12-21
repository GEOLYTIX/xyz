const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);
const db_cluster = pgp(process.env.POSTGRES_MVT);

function location(req, res){
    let d = parseFloat(req.query.dist),
        q = "SELECT ST_AsGeoJson(ST_Centroid(ST_Union(sq.geomcntr))) AS geomj, json_agg(json_build_object('id', sq.id, 'brand', sq.brand, 'label', sq.label)) AS infoj FROM (SELECT " 
    + req.query.qid + " as id, brand, " 
    + req.query.label + " as label, ST_ClusterDBSCAN(geomcntr, " 
    + d + ", 1) over() AS cid, geomcntr FROM " 
    + req.query.layer + " WHERE ST_DWithin(ST_MakeEnvelope("
    + [req.query.west, req.query.north, req.query.east, req.query.south].join() 
    + ", 4326), geomcntr, 0.000001)) as sq GROUP BY sq.cid;";
    
    //console.log(q);
    
    db_cluster.any(q).then(function(data){
        res.status(200).json(data);
    });
}

function location_info(req, res){
        let q = "SELECT geomj, infoj, "
            + req.query.vector + " as vector FROM "
            + req.query.layer + " WHERE "
            + req.query.qid + " = "
            + req.query.id;
        // console.log(q);

        db.any(q).then(function (data) {
            res.status(200).json(data);
        });
}

module.exports = {
    location: location,
    location_info: location_info
};